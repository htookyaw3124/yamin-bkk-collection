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

const labelBase = "text-[10px] font-black uppercase tracking-widest text-slate-400";

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
      const payload = {
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
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      setError(error?.data?.message || "Failed to create order");
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-100">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-400 mb-1">Operational Flow</p>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight italic">Manual Transaction</h2>
          <p className="text-xs font-semibold text-slate-500 mt-2 uppercase tracking-wider opacity-60">
            Generate customized orders for specialized clients.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="h-10 px-6 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-slate-100 hover:text-slate-900 hover:border-slate-900 hover:bg-white transition-all shadow-sm"
        >
          Discard Changes
        </button>
      </div>

      {error && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-2 shadow-lg animate-pulse" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Customer Section */}
        <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm group hover:shadow-xl hover:shadow-slate-900/5 transition-all outline outline-0 hover:outline-1 outline-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-300">
                Segment 01
              </p>
              <h3 className="text-lg font-black text-slate-900 italic">Client Intelligence</h3>
            </div>
            <label className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:bg-slate-900 hover:text-white transition-all select-none">
              <input
                type="checkbox"
                checked={isNewCustomer}
                onChange={(e) => setIsNewCustomer(e.target.checked)}
                className="hidden"
              />
              <div className={`w-3 h-3 rounded-full border-2 transition-all ${isNewCustomer ? 'bg-white border-white scale-110' : 'border-slate-300'}`} />
              Anonymous Identity
            </label>
          </div>

          {!isNewCustomer ? (
            <div className="space-y-2">
              <label className={labelBase}>Registered Profiles</label>
              <div className="relative">
                {customersLoading ? (
                  <div className="h-12 flex items-center px-4 rounded-xl bg-slate-50 animate-pulse text-[10px] font-bold text-slate-300 uppercase italic">Retrieving secure data...</div>
                ) : (
                  <select
                    className="w-full h-14 bg-slate-50 border border-transparent rounded-2xl px-5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-brand transition-all appearance-none cursor-pointer"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                  >
                    <option value="" className="font-normal text-slate-400 italic">Select verified contact</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.phone}
                      </option>
                    ))}
                  </select>
                )}
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 font-black text-xs">▼</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className={labelBase}>Legal Name</label>
                <input
                  className="w-full h-14 bg-slate-50 border border-transparent rounded-2xl px-5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-brand transition-all"
                  placeholder="Enter contact name"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className={labelBase}>Encrypted Contact</label>
                <input
                  className="w-full h-14 bg-slate-50 border border-transparent rounded-2xl px-5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-brand transition-all"
                  placeholder="+95 9..."
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className={labelBase}>Logistic Endpoint</label>
            <textarea
              className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-brand transition-all resize-none"
              placeholder="Primary shipping coordinate..."
              rows={3}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </div>
        </div>

        {/* Status Section */}
        <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm group hover:shadow-xl hover:shadow-slate-900/5 transition-all outline outline-0 hover:outline-1 outline-slate-50">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-300">
              Segment 02
            </p>
            <h3 className="text-lg font-black text-slate-900 italic">Transaction Status</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelBase}>Order State</label>
              <div className="relative">
                <select
                  className="w-full h-14 bg-slate-50 border border-transparent rounded-2xl px-5 text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none focus:bg-white focus:border-brand transition-all appearance-none cursor-pointer"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 font-black text-xs">▼</div>
              </div>
            </div>
            <div className="space-y-2">
              <label className={labelBase}>Payment State</label>
              <div className="relative">
                <select
                  className="w-full h-14 bg-slate-50 border border-transparent rounded-2xl px-5 text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none focus:bg-white focus:border-brand transition-all appearance-none cursor-pointer"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 font-black text-xs">▼</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelBase}>Certified Paid Value (THB)</label>
            <div className="relative">
              <input
                type="number"
                className="w-full h-20 bg-slate-900 border-none rounded-2xl px-8 text-2xl font-black text-emerald-400 outline-none focus:ring-4 focus:ring-brand/20 transition-all shadow-inner placeholder:text-slate-800"
                placeholder="0.00"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
              />
              <div className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-slate-600 tracking-tighter text-sm uppercase">Currency / THB</div>
            </div>
          </div>
          
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-relaxed">
            Note: All manual transactions bypass the standard client verification layer. Proceed with administrative caution.
          </div>
        </div>

        {/* Items Section */}
        <div className="md:col-span-2 space-y-8 rounded-[40px] border border-slate-100 bg-white p-10 shadow-sm transition-all outline outline-0 hover:outline-1 outline-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-300">
                Inventory Allocation
              </p>
              <h3 className="text-2xl font-black text-slate-900 italic">Selected Artifacts</h3>
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="h-14 px-8 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 shadow-sm hover:border-slate-900 hover:bg-slate-50 hover:-translate-y-1 transition-all flex items-center gap-3 active:scale-95"
            >
              <Plus size={16} /> Add Acquisition
            </button>
          </div>

          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-16 text-center animate-in fade-in zoom-in-95 duration-500">
              <Plus size={48} className="mx-auto text-slate-200 mb-6 opacity-50" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 max-w-[200px] mx-auto leading-loose">
                Operational queue is empty. Initialize an item entry.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1.5fr_1fr_60px] gap-6 items-center rounded-3xl border border-slate-50 bg-white p-6 shadow-sm hover:shadow-lg hover:shadow-slate-900/5 hover:-translate-y-0.5 transition-all outline outline-1 outline-transparent hover:outline-slate-100"
                  >
                    <div className="space-y-1.5">
                      <label className={labelBase}>Product Hierarchy</label>
                      <div className="relative">
                        <select
                          className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold text-slate-900 outline-none appearance-none cursor-pointer"
                          value={item.productId}
                          onChange={(e) =>
                            handleItemChange(item.id, "productId", e.target.value)
                          }
                        >
                          <option value="">Artifact Search...</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name_en.toUpperCase()}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 text-[8px]">▼</div>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className={labelBase}>Configuration</label>
                      <div className="relative">
                        <select
                          className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold text-slate-900 outline-none appearance-none cursor-pointer disabled:opacity-30 transition-opacity"
                          value={item.variantId || ""}
                          onChange={(e) =>
                            handleItemChange(item.id, "variantId", e.target.value)
                          }
                          disabled={!product || !product.variants || product.variants.length === 0}
                        >
                          <option value="">Standard</option>
                          {product?.variants?.map((v: { id: string; name_en: string }) => (
                            <option key={v.id} value={v.id}>
                              {v.name_en.toUpperCase()}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 text-[8px]">▼</div>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className={labelBase}>Valuation</label>
                      <input
                        type="number"
                        className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold text-slate-900 outline-none"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(item.id, "unitPrice", e.target.value)
                        }
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className={labelBase}>Qty</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold text-slate-900 outline-none text-center"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="mt-5 w-12 h-12 flex items-center justify-center rounded-xl text-slate-200 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                      aria-label="Remove entry"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:justify-end sm:items-baseline gap-6 mt-10 pt-10 border-t border-slate-50">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
              Total Fiscal Impact
            </span>
            <div className="flex items-baseline gap-2">
               <span className="text-5xl font-black text-slate-900 tracking-tighter italic">
                 {totalAmount.toLocaleString()}
               </span>
               <span className="text-xs font-black text-slate-300 uppercase tracking-widest">MMK</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-5 pt-10 border-t border-slate-100">
        <button
          onClick={onCancel}
          className="h-14 px-10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all active:scale-95"
        >
          Abandon Order
        </button>
        <button
          onClick={handleSubmit}
          disabled={isCreating}
          className="h-14 px-12 rounded-full bg-brand text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-brand/40 hover:bg-brand-hover transition-all disabled:opacity-20 hover:-translate-y-1 active:scale-95 btn-premium"
        >
          {isCreating ? "Writing State..." : "Execute Order"}
        </button>
      </div>

    </div>
  );
};
