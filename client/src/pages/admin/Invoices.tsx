import { useState } from "react";
import { trpc } from "../../lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import {
  FileText, Plus, Download, Mail, CheckCircle, Clock, AlertCircle,
  XCircle, Eye, Edit, ChevronDown, ChevronUp, Search, Filter
} from "lucide-react";

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
type InvoiceType = "analysis" | "shop" | "installment" | "final" | "credit_note";

const statusConfig: Record<InvoiceStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  draft: { label: "Entwurf", color: "bg-gray-100 text-gray-700", icon: Edit },
  sent: { label: "Offen", color: "bg-blue-100 text-blue-700", icon: Clock },
  paid: { label: "Bezahlt", color: "bg-green-100 text-green-700", icon: CheckCircle },
  overdue: { label: "Überfällig", color: "bg-red-100 text-red-700", icon: AlertCircle },
  cancelled: { label: "Storniert", color: "bg-gray-100 text-gray-500", icon: XCircle },
};

const typeConfig: Record<InvoiceType, { label: string; color: string }> = {
  analysis: { label: "Analyse", color: "bg-purple-100 text-purple-700" },
  shop: { label: "Shop", color: "bg-cyan-100 text-cyan-700" },
  installment: { label: "Abschlag", color: "bg-amber-100 text-amber-700" },
  final: { label: "Schlussrechnung", color: "bg-emerald-100 text-emerald-700" },
  credit_note: { label: "Gutschrift", color: "bg-pink-100 text-pink-700" },
};

export default function AdminInvoices() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const { data: invoices, isLoading, refetch } = trpc.invoice.list.useQuery();
  const updateStatusMutation = trpc.invoice.updateStatus.useMutation({
    onSuccess: () => refetch(),
  });
  
  const formatCurrency = (amount: number, currency: string = "EUR") => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(amount);
  };
  
  const formatDate = (date: string | Date | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(new Date(date));
  };
  
  const filteredInvoices = invoices?.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  const utils = trpc.useUtils();
  
  const handleDownloadPdf = async (invoiceId: number, invoiceNumber: string) => {
    try {
      // Get HTML from server
      const html = await utils.invoice.getHtml.fetch({ invoiceId });
      
      // Open in new window for printing/saving as PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Fehler beim Herunterladen der Rechnung');
    }
  };
  
  const handleStatusChange = async (invoiceId: number, newStatus: InvoiceStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        invoiceId,
        status: newStatus,
        ...(newStatus === 'paid' ? { paidAt: new Date(), paymentMethod: 'manual' } : {}),
      });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Fehler beim Aktualisieren des Status');
    }
  };
  
  // Calculate totals
  const totals = {
    total: filteredInvoices?.reduce((sum, inv) => sum + inv.grossAmount, 0) || 0,
    paid: filteredInvoices?.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.grossAmount, 0) || 0,
    open: filteredInvoices?.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.grossAmount, 0) || 0,
    overdue: filteredInvoices?.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.grossAmount, 0) || 0,
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B4D8]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Rechnungsverwaltung</h1>
          <p className="text-gray-600 mt-1">Verwalten Sie alle Rechnungen und Abschläge</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#00B4D8] text-white rounded-lg hover:bg-[#0096B4] transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-5 h-5" />
          Neue Abschlagrechnung
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Gesamt</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totals.total)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Bezahlt</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totals.paid)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Offen</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(totals.open)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Überfällig</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totals.overdue)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Suche nach Rechnungsnummer, Kunde..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | "all")}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
            >
              <option value="all">Alle Status</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Invoice List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Rechnung</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Kunde</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Typ</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Datum</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Betrag</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Keine Rechnungen gefunden</p>
                    <p className="text-sm mt-1">Erstellen Sie eine neue Abschlagrechnung oder warten Sie auf Stripe-Zahlungen.</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices?.map((invoice) => {
                  const StatusIcon = statusConfig[invoice.status as InvoiceStatus]?.icon || Clock;
                  const isExpanded = expandedId === invoice.id;
                  
                  return (
                    <>
                      <tr 
                        key={invoice.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : invoice.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            <span className="font-mono font-medium text-gray-900">{invoice.invoiceNumber}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{invoice.customerName}</p>
                            {invoice.customerEmail && (
                              <p className="text-sm text-gray-500">{invoice.customerEmail}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeConfig[invoice.type as InvoiceType]?.color || 'bg-gray-100 text-gray-700'}`}>
                            {typeConfig[invoice.type as InvoiceType]?.label || invoice.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(invoice.invoiceDate)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {formatCurrency(invoice.grossAmount, invoice.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusConfig[invoice.status as InvoiceStatus]?.color || 'bg-gray-100 text-gray-700'}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[invoice.status as InvoiceStatus]?.label || invoice.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleDownloadPdf(invoice.id, invoice.invoiceNumber)}
                              className="p-2 text-gray-400 hover:text-[#00B4D8] hover:bg-gray-100 rounded-lg transition-colors"
                              title="PDF herunterladen"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                              <button
                                onClick={() => handleStatusChange(invoice.id, 'paid')}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Als bezahlt markieren"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${invoice.id}-details`} className="bg-gray-50">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500 mb-1">Kundenadresse</p>
                                <p className="text-gray-900 whitespace-pre-line">{invoice.customerAddress || '-'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Beträge</p>
                                <p className="text-gray-900">Netto: {formatCurrency(invoice.netAmount, invoice.currency)}</p>
                                <p className="text-gray-900">MwSt. ({invoice.vatRate}%): {formatCurrency(invoice.vatAmount, invoice.currency)}</p>
                                <p className="font-medium text-gray-900">Brutto: {formatCurrency(invoice.grossAmount, invoice.currency)}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Details</p>
                                <p className="text-gray-900">Fällig: {formatDate(invoice.dueDate)}</p>
                                {invoice.paidAt && <p className="text-green-600">Bezahlt: {formatDate(invoice.paidAt)}</p>}
                                {invoice.installmentNumber && (
                                  <p className="text-gray-900">Abschlag {invoice.installmentNumber} von {invoice.totalInstallments}</p>
                                )}
                              </div>
                            </div>
                            {invoice.description && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-gray-500 mb-1">Beschreibung</p>
                                <p className="text-gray-900">{invoice.description}</p>
                              </div>
                            )}
                            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                              <select
                                value={invoice.status}
                                onChange={(e) => handleStatusChange(invoice.id, e.target.value as InvoiceStatus)}
                                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]"
                              >
                                {Object.entries(statusConfig).map(([key, config]) => (
                                  <option key={key} value={key}>{config.label}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Create Modal */}
      {showCreateModal && (
        <CreateInvoiceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}
      </div>
    </DashboardLayout>
  );
}

// Create Invoice Modal Component
function CreateInvoiceModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    contractId: 0,
    customerName: "",
    customerEmail: "",
    customerCompany: "",
    customerAddress: "",
    customerVatId: "",
    description: "",
    installmentNumber: 1,
    totalInstallments: 3,
    vatRate: 7.7,
    currency: "CHF",
    notes: "",
  });
  
  const [items, setItems] = useState([
    { description: "", quantity: 1, unit: "Stück", unitPrice: 0 }
  ]);
  
  const createMutation = trpc.invoice.createInstallment.useMutation({
    onSuccess: () => onSuccess(),
  });
  
  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit: "Stück", unitPrice: 0 }]);
  };
  
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };
  
  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };
  
  const calculateTotal = () => {
    const net = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vat = net * (formData.vatRate / 100);
    return { net, vat, gross: net + vat };
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMutation.mutateAsync({
        ...formData,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
        })),
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Fehler beim Erstellen der Rechnung');
    }
  };
  
  const totals = calculateTotal();
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Neue Abschlagrechnung erstellen</h2>
          <p className="text-gray-600 mt-1">Erstellen Sie eine manuelle Rechnung für einen Vertrag</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kundenname *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
              <input
                type="text"
                value={formData.customerCompany}
                onChange={(e) => setFormData({ ...formData, customerCompany: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">USt-IdNr.</label>
              <input
                type="text"
                value={formData.customerVatId}
                onChange={(e) => setFormData({ ...formData, customerVatId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <textarea
              value={formData.customerAddress}
              onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]"
            />
          </div>
          
          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vertrag-ID *</label>
              <input
                type="number"
                required
                value={formData.contractId || ""}
                onChange={(e) => setFormData({ ...formData, contractId: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Abschlag Nr.</label>
              <input
                type="number"
                min={1}
                value={formData.installmentNumber}
                onChange={(e) => setFormData({ ...formData, installmentNumber: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">von Gesamt</label>
              <input
                type="number"
                min={1}
                value={formData.totalInstallments}
                onChange={(e) => setFormData({ ...formData, totalInstallments: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Währung</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]"
              >
                <option value="CHF">CHF</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="z.B. Strukturierungsberatung - Phase 1"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]"
            />
          </div>
          
          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Positionen</label>
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-[#00B4D8] hover:text-[#0096B4]"
              >
                + Position hinzufügen
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input
                    type="text"
                    placeholder="Beschreibung"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]"
                  />
                  <input
                    type="number"
                    placeholder="Menge"
                    min={0.01}
                    step={0.01}
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]"
                  />
                  <input
                    type="text"
                    placeholder="Einheit"
                    value={item.unit}
                    onChange={(e) => updateItem(index, 'unit', e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]"
                  />
                  <input
                    type="number"
                    placeholder="Preis"
                    min={0}
                    step={0.01}
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-28 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Totals */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Netto:</span>
                  <span className="font-medium">{totals.net.toFixed(2)} {formData.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">MwSt. ({formData.vatRate}%):</span>
                  <span className="font-medium">{totals.vat.toFixed(2)} {formData.currency}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span>Gesamt:</span>
                  <span className="text-[#00B4D8]">{totals.gross.toFixed(2)} {formData.currency}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interne Notizen</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8]"
            />
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-[#00B4D8] text-white rounded-lg hover:bg-[#0096B4] transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Erstelle...' : 'Rechnung erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
