import { useState } from "react";
import { useGetOrdersQuery, useDeleteOrderMutation, useUpdateOrderMutation } from "../../lib/api";
import { Search, Eye, Trash2, X, Upload } from "lucide-react";
import type { Lang } from "../../types";
import { AdminOrderForm } from "./AdminOrderForm";

interface AdminOrdersPanelProps {
  lang: Lang;
}

const ORDER_STATUSES = [
  "PRE_ORDER",
  "PROCESSING",
  "DELIVERING",
  "COMPLETED",
  "CANCELLED",
];

export const AdminOrdersPanel = ({ lang }: AdminOrdersPanelProps) => {
  const { data: orders = [], isLoading, error } = useGetOrdersQuery();
  const [deleteOrder] = useDeleteOrderMutation();
  const [updateOrder] = useUpdateOrderMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const customerName = order.customer?.name?.toLowerCase() || "";
    const customerPhone = order.customer?.phone?.toLowerCase() || "";
    
    const matchesSearch =
      !term || customerName.includes(term) || customerPhone.includes(term) || order.id.toLowerCase().includes(term);
    
    const matchesStatus = statusFilter === "All" || order.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    setActionError(null);
    try {
      await deleteOrder(orderId).unwrap();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      setActionError(error?.data?.message || "Failed to delete order");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading orders...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load orders</div>;

  return (
    <div className="space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-slate-50">
        <div className="flex flex-1 items-center gap-4 bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm focus-within:ring-4 focus-within:ring-slate-900/5 focus-within:border-slate-900 transition-all">
          <Search size={20} className="text-slate-400" />
          <input
            className="w-full text-sm font-semibold outline-none text-slate-900 placeholder:text-slate-300 placeholder:font-normal"
            placeholder="Search by ID, name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <select
            className="h-14 bg-white border border-slate-100 rounded-2xl px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 outline-none focus:border-brand hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="h-10 bg-brand hover:bg-brand-hover text-white rounded-full px-6 text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            {showCreateForm ? (
               <>
                 <X size={14} /> Close
               </>
            ) : (
               <>
                 <Upload size={14} /> Create Order
               </>
            )}
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold">
           {actionError}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 animate-in fade-in zoom-in-95 duration-300">
          <AdminOrderForm
            lang={lang}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {!showCreateForm && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-[140px_2fr_120px_140px_160px_100px] gap-4 text-[10px] uppercase tracking-[0.3em] text-slate-400 px-8 py-5 bg-slate-50/50 border-b border-slate-100 font-bold">
            <span>Reference</span>
            <span>Customer Details</span>
            <span>Order Date</span>
            <span>Total Value</span>
            <span>Current Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-slate-50">
            {filteredOrders.length === 0 ? (
              <div className="px-8 py-24 text-sm text-slate-400 text-center italic">
                No orders identified in the current system state.
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-1 md:grid-cols-[140px_2fr_120px_140px_160px_100px] gap-4 items-center px-8 py-6 text-sm group hover:bg-slate-50/50 transition-all"
                >
                  <div className="bg-slate-100 text-slate-500 font-mono text-[10px] px-2.5 py-1.5 rounded-lg w-fit border border-slate-200 group-hover:bg-white group-hover:text-slate-900 transition-all">
                    #{order.id.slice(-8).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold uppercase tracking-tight text-base">
                      {order.customer?.name || "Anonymous Client"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      {order.customer?.phone || "Private Contact"}
                    </p>
                  </div>
                  <div className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "---"}
                  </div>
                  <div className="text-slate-900 font-black text-sm tracking-tight">
                    {Number(order.totalAmount).toLocaleString()} <span className="text-[10px] font-bold text-slate-300">MMK</span>
                  </div>
                  <div>
                    <select
                      className={`h-9 px-4 rounded-full text-[9px] font-black uppercase tracking-widest outline-none border-0 ring-1 cursor-pointer transition-all ${
                        order.orderStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 ring-emerald-100 focus:ring-emerald-500' :
                        order.orderStatus === 'CANCELLED' ? 'bg-red-50 text-red-600 ring-red-100 focus:ring-red-500' :
                        order.orderStatus === 'PROCESSING' ? 'bg-blue-50 text-blue-600 ring-blue-100 focus:ring-blue-500' :
                        'bg-amber-50 text-amber-600 ring-amber-100 focus:ring-amber-500'
                      }`}
                      value={order.orderStatus}
                      onChange={async (e) => {
                        setActionError(null);
                        try {
                          await updateOrder({ id: order.id, payload: { orderStatus: e.target.value } }).unwrap();
                        } catch (err: unknown) {
                          const error = err as { data?: { message?: string } };
                          setActionError(error?.data?.message || "Failed to update order status");
                        }
                      }}
                    >
                      {ORDER_STATUSES.map(status => (
                        <option key={status} value={status}>
                          {status.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button
                      title="View Transaction"
                      className="p-2.5 rounded-full border border-slate-100 bg-white text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm active:scale-90"
                      onClick={() => alert("Order intelligence view coming soon")}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      title="Archive Transaction"
                      onClick={() => handleDelete(order.id)}
                      className="p-2.5 rounded-full border border-slate-100 bg-white text-slate-400 hover:text-red-500 hover:border-red-500 transition-all shadow-sm active:scale-90"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
