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
  const inputBase =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200";
  const selectBase = `${inputBase} pr-8`;
  const labelBase =
    "block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2";

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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Create Order</p>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900">Manual Order</h2>
          <p className="text-sm text-slate-500 mt-1">
            Build a custom order and assign a customer.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900"
        >
          Close
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Customer Section */}
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                Customer
              </p>
              <h3 className="text-base font-semibold text-slate-900">Customer Details</h3>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
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
              <label className={labelBase}>Select Existing</label>
              {customersLoading ? (
                <p className="text-xs text-slate-400">Loading customers...</p>
              ) : (
                <select
                  className={selectBase}
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">Select a customer</option>
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
                className={inputBase}
                placeholder="Full Name"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
              />
              <input
                className={inputBase}
                placeholder="Phone Number"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
              />
            </div>
          )}

          <input
            className={inputBase}
            placeholder="Delivery Address (Optional)"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
          />
        </div>

        {/* Status Section */}
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
              Status
            </p>
            <h3 className="text-base font-semibold text-slate-900">Order & Payment</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>Order Status</label>
              <select
                className={selectBase}
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelBase}>Payment Status</label>
              <select
                className={selectBase}
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelBase}>Total Paid Amount (THB)</label>
            <input
              type="number"
              className={inputBase}
              placeholder="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
            />
          </div>
        </div>

        {/* Items Section */}
        <div className="md:col-span-2 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                Items
              </p>
              <h3 className="text-base font-semibold text-slate-900">Order Items</h3>
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-colors"
            >
              <Plus size={14} /> Add Item
            </button>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              No items added yet. Order total will be 0.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_40px] gap-3 items-end rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div>
                      <label className={labelBase}>Product</label>
                      <select
                        className={selectBase}
                        value={item.productId}
                        onChange={(e) =>
                          handleItemChange(item.id, "productId", e.target.value)
                        }
                      >
                        <option value="">Select Product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name_en}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelBase}>Variant</label>
                      <select
                        className={selectBase}
                        value={item.variantId || ""}
                        onChange={(e) =>
                          handleItemChange(item.id, "variantId", e.target.value)
                        }
                        disabled={!product || !product.variants || product.variants.length === 0}
                      >
                        <option value="">No Variant</option>
                        {product?.variants?.map((v: any) => (
                          <option key={v.id} value={v.id}>
                            {v.name_en}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelBase}>Price</label>
                      <input
                        type="number"
                        className={inputBase}
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(item.id, "unitPrice", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className={labelBase}>Qty</label>
                      <input
                        type="number"
                        min="1"
                        className={inputBase}
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
                      className="mb-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3 mt-6 pt-6 border-t border-slate-100">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Calculated Total
            </span>
            <span className="text-2xl font-semibold text-slate-900">
              {totalAmount.toLocaleString()} THB
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
        <button
          onClick={onCancel}
          className="px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold border border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isCreating}
          className="px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {isCreating ? "Saving..." : "Save Order"}
        </button>
      </div>

    </div>
  );
};
