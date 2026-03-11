import { useState } from "react";
import { useGetOrdersQuery, useDeleteOrderMutation, useUpdateOrderMutation } from "../../lib/api";
import { Search, Eye, Trash2 } from "lucide-react";
import type { Lang, Order } from "../../types";
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
    } catch (err: any) {
      setActionError(err?.data?.message || "Failed to delete order");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading orders...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load orders</div>;

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-1 items-center gap-3 border border-slate-200 rounded-full px-4 py-2 bg-white">
          <Search size={16} className="text-slate-400" />
          <input
            className="w-full text-sm outline-none bg-transparent"
            placeholder="Search by customer name, phone, or order ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="border border-slate-200 rounded-full px-4 py-2 text-xs uppercase tracking-widest bg-white"
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
            className="px-5 py-2 rounded-full text-xs uppercase tracking-widest font-bold bg-slate-900 text-white hover:bg-pink-600 transition-colors"
          >
            {showCreateForm ? "Hide Form" : "Create Order"}
          </button>
        </div>
      </div>

      {actionError && <p className="text-xs text-red-500">{actionError}</p>}

      {showCreateForm && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
          <AdminOrderForm
            lang={lang}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {!showCreateForm && (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1fr_1fr_100px] gap-4 text-[10px] uppercase tracking-[0.3em] text-slate-400 px-6 py-4 border-b border-slate-100">
            <span>Order ID</span>
            <span>Customer</span>
            <span>Date</span>
            <span>Total</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredOrders.length === 0 ? (
              <div className="px-6 py-12 text-sm text-slate-500 text-center">
                No orders found.
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1fr_1fr_100px] gap-4 items-center px-6 py-4 text-sm"
                >
                  <div className="font-mono text-xs text-slate-500 truncate">
                    {order.id.slice(0, 8)}...
                  </div>
                  <div>
                    <p className="text-slate-900 font-medium">
                      {order.customer?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {order.customer?.phone || "No phone"}
                    </p>
                  </div>
                  <div className="text-slate-500 text-xs">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                  </div>
                  <div className="text-slate-900 font-medium whitespace-nowrap">
                    {Number(order.totalAmount).toLocaleString()} THB
                  </div>
                  <div>
                    <select
                      className={`outline-none border-none cursor-pointer inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                        order.orderStatus === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                        order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        order.orderStatus === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}
                      value={order.orderStatus}
                      onChange={async (e) => {
                        setActionError(null);
                        try {
                          await updateOrder({ id: order.id, payload: { orderStatus: e.target.value } }).unwrap();
                        } catch (err: any) {
                          setActionError(err?.data?.message || "Failed to update order status");
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
                  <div className="flex items-center justify-end gap-2">
                    <button
                      title="View Details"
                      className="p-2 rounded-full border border-slate-200 hover:border-slate-900 transition-colors"
                      onClick={() => alert("Order details modal coming soon")}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      title="Delete Order"
                      onClick={() => handleDelete(order.id)}
                      className="p-2 rounded-full border border-slate-200 hover:border-rose-500 hover:text-rose-500 transition-colors"
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
