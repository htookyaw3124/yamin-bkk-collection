import { useState } from "react";
import { useGetProductsQuery, useGetCustomersQuery, useCreateOrderMutation } from "../../lib/api";
import { Plus, Trash2 } from "lucide-react";
import type { Lang, OrderStatus, PaymentStatus } from "../../types";

interface AdminOrderFormProps {
  lang: Lang;
  onCancel: () => void;
}

const ORDER_STATUSES: OrderStatus[] = [
  "PRE_ORDER",
  "PROCESSING",
  "DELIVERING",
  "COMPLETED",
  "CANCELLED",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "HALF_PAID",
  "FULL_PAID",
  "REFUNDED",
];

type OrderItemDraft = {
  id: string; // temp id for UI
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: string;
};

export const AdminOrderForm = ({ onCancel }: AdminOrderFormProps) => {
  const { data: products = [] } = useGetProductsQuery();
  const { data: customers = [], isLoading: customersLoading } = useGetCustomersQuery();
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();

  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [items, setItems] = useState<OrderItemDraft[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("PENDING");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("PRE_ORDER");
  const [paidAmount, setPaidAmount] = useState<string>("0");

  const [error, setError] = useState<string | null>(null);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(36).substr(2, 9),
        productId: "",
        variantId: "",
        quantity: 1,
        unitPrice: "0",
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof OrderItemDraft, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "productId") {
            const product = products.find((p) => p.id === value);
            if (product) {
              updated.unitPrice = product.price.toString();
              updated.variantId = "";
            }
          }
          if (field === "variantId" && value) {
             const product = products.find(p => p.id === item.productId);
             const variant = product?.variants?.find(v => v.id === value);
             if (variant && variant.priceOverride) {
                 updated.unitPrice = variant.priceOverride.toString();
             }
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Calculate totals
  const totalAmount = items.reduce(
    (sum, item) => sum + (Number(item.unitPrice) || 0) * (item.quantity || 1),
    0
  );

  const handleSubmit = async () => {
    setError(null);
    if (!isNewCustomer && !customerId) {
        setError("Please select a customer or define a new one.");
        return;
    }
    if (isNewCustomer && (!newCustomerName || !newCustomerPhone)) {
        setError("Please provide name and phone for the new customer.");
        return;
    }
    if (items.length === 0) {
        setError("Please add at least one item to the order.");
        return;
    }
    
    // Validate items
    for (const item of items) {
        if (!item.productId) {
            setError("All order items must have a selected product.");
            return;
        }
    }

    try {
      const payload: any = {
        deliveryAddress: deliveryAddress || undefined,
        totalAmount,
        paidAmount: Number(paidAmount) || 0,
        paymentStatus,
        orderStatus,
        customer: isNewCustomer
          ? { create: { name: newCustomerName, phone: newCustomerPhone, address: deliveryAddress } }
          : { connect: { id: customerId } },
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || undefined,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            subtotal: Number(item.unitPrice) * Number(item.quantity),
            itemStatus: "PENDING",
            refundedAmount: 0,
          })),
        },
      };

      await createOrder(payload).unwrap();
      onCancel(); // Close form on success
    } catch (err: any) {
      setError(err?.data?.message || "Failed to create order");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-light text-slate-900">Create Manual Order</h2>
          <p className="text-xs text-slate-400 mt-1">Admin order creation</p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900"
        >
          Close
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Customer Section */}
        <div className="space-y-5 bg-white p-5 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Customer Details</h3>
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewCustomer}
                onChange={(e) => setIsNewCustomer(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              New Customer
            </label>
          </div>

          {!isNewCustomer ? (
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Select Existing</label>
              {customersLoading ? (
                 <p className="text-xs text-slate-400">Loading customers...</p>
              ) : (
                <select
                    className="w-full border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900 bg-transparent"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                >
                    <option value="">-- Choose Customer --</option>
                    {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                    </option>
                    ))}
                </select>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <input
                className="w-full border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900"
                placeholder="Full Name"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
              />
              <input
                className="w-full border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900"
                placeholder="Phone Number"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
              />
            </div>
          )}
          
          <input
            className="w-full border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900"
            placeholder="Specific Delivery Address (Optional)"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
          />
        </div>

        {/* Status Section */}
        <div className="space-y-5 bg-white p-5 rounded-xl border border-slate-100">
           <h3 className="text-sm font-bold text-slate-900">Order Status & Payment</h3>
           
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Order Status</label>
               <select
                 className="w-full border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900 bg-transparent"
                 value={orderStatus}
                 onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
               >
                 {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Payment Status</label>
               <select
                 className="w-full border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900 bg-transparent"
                 value={paymentStatus}
                 onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
               >
                 {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
               </select>
             </div>
           </div>

           <div>
             <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Total Paid Amount (THB)</label>
             <input
               type="number"
               className="w-full border-b border-slate-200 py-2 text-sm outline-none focus:border-slate-900"
               placeholder="0"
               value={paidAmount}
               onChange={(e) => setPaidAmount(e.target.value)}
             />
           </div>
        </div>

        {/* Items Section */}
        <div className="md:col-span-2 space-y-5 bg-white p-5 rounded-xl border border-slate-100">
           <div className="flex items-center justify-between">
             <h3 className="text-sm font-bold text-slate-900">Order Items</h3>
             <button
               type="button"
               onClick={handleAddItem}
               className="flex items-center gap-1 text-xs uppercase tracking-widest font-bold text-pink-600 hover:text-slate-900 transition-colors"
             >
               <Plus size={14} /> Add Item
             </button>
           </div>
           
           {items.length === 0 ? (
             <p className="text-sm text-slate-400 italic">No items added yet. Order total will be 0.</p>
           ) : (
             <div className="space-y-3">
               {items.map((item) => {
                 const product = products.find(p => p.id === item.productId);
                 return (
                   <div key={item.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_40px] gap-3 items-end border-b border-slate-100 pb-3">
                     <div>
                       <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">Product</label>
                       <select
                         className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm outline-none focus:border-slate-900 bg-transparent"
                         value={item.productId}
                         onChange={(e) => handleItemChange(item.id, "productId", e.target.value)}
                       >
                         <option value="">Select Product...</option>
                         {products.map(p => <option key={p.id} value={p.id}>{p.name_en}</option>)}
                       </select>
                     </div>
                     <div>
                       <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">Variant</label>
                       <select
                         className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm outline-none focus:border-slate-900 bg-transparent"
                         value={item.variantId || ""}
                         onChange={(e) => handleItemChange(item.id, "variantId", e.target.value)}
                         disabled={!product || !product.variants || product.variants.length === 0}
                       >
                         <option value="">No Variant</option>
                         {product?.variants?.map((v: any) => (
                           <option key={v.id} value={v.id}>{v.name_en}</option>
                         ))}
                       </select>
                     </div>
                     <div>
                       <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">Price</label>
                       <input
                         type="number"
                         className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm outline-none focus:border-slate-900"
                         value={item.unitPrice}
                         onChange={(e) => handleItemChange(item.id, "unitPrice", e.target.value)}
                       />
                     </div>
                     <div>
                       <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">Qty</label>
                       <input
                         type="number"
                         min="1"
                         className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm outline-none focus:border-slate-900"
                         value={item.quantity}
                         onChange={(e) => handleItemChange(item.id, "quantity", parseInt(e.target.value) || 1)}
                       />
                     </div>
                     <button
                       type="button"
                       onClick={() => handleRemoveItem(item.id)}
                       className="mb-1 p-2 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                     >
                       <Trash2 size={16} />
                     </button>
                   </div>
                 );
               })}
             </div>
           )}

           <div className="flex justify-end items-center gap-4 mt-6 pt-6 border-t border-slate-100">
              <span className="text-sm uppercase tracking-widest text-slate-400">Calculated Total</span>
              <span className="text-2xl font-light text-slate-900">{totalAmount.toLocaleString()} THB</span>
           </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
        <button
          onClick={onCancel}
          className="px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold border border-slate-200 hover:border-slate-900 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isCreating}
          className="px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold bg-slate-900 text-white hover:bg-pink-600 transition-colors disabled:opacity-50"
        >
          {isCreating ? "Saving..." : "Save Order"}
        </button>
      </div>

    </div>
  );
};
