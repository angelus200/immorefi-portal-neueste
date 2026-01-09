import { useState } from "react";
import { trpc } from "../lib/trpc";
import DashboardLayout from "../components/DashboardLayout";
import { 
  FileText, Download, CheckCircle, Clock, AlertCircle, 
  XCircle, Eye, ChevronDown, ChevronUp, Search
} from "lucide-react";

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
type InvoiceType = "analysis" | "shop" | "installment" | "final" | "credit_note";

const statusConfig: Record<InvoiceStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  draft: { label: "Entwurf", color: "bg-gray-100 text-gray-700", icon: FileText },
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

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const { data: invoices, isLoading } = trpc.invoice.myInvoices.useQuery();
  
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
  
  const filteredInvoices = invoices?.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const utils = trpc.useUtils();
  
  const handleDownloadPdf = async (invoiceId: number, invoiceNumber: string) => {
    try {
      const html = await utils.invoice.getHtml.fetch({ invoiceId });
      
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
  
  // Calculate totals
  const totals = {
    total: filteredInvoices?.reduce((sum, inv) => sum + inv.grossAmount, 0) || 0,
    paid: filteredInvoices?.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.grossAmount, 0) || 0,
    open: filteredInvoices?.filter(inv => inv.status === 'sent' || inv.status === 'overdue').reduce((sum, inv) => sum + inv.grossAmount, 0) || 0,
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meine Rechnungen</h1>
          <p className="text-gray-600 mt-1">Übersicht aller Ihrer Rechnungen und Zahlungen</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
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
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
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
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Offen</p>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(totals.open)}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Suche nach Rechnungsnummer oder Beschreibung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Invoice List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B4D8]"></div>
            </div>
          ) : filteredInvoices?.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Keine Rechnungen gefunden</p>
              <p className="text-sm mt-1">Ihre Rechnungen werden hier angezeigt, sobald Sie einen Kauf tätigen.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Rechnung</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Typ</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Datum</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Betrag</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInvoices?.map((invoice) => {
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
                              <div>
                                <span className="font-mono font-medium text-gray-900">{invoice.invoiceNumber}</span>
                                {invoice.description && (
                                  <p className="text-sm text-gray-500 truncate max-w-[200px]">{invoice.description}</p>
                                )}
                              </div>
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
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${invoice.id}-details`} className="bg-gray-50">
                            <td colSpan={6} className="px-4 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500 mb-1">Beträge</p>
                                  <p className="text-gray-900">Netto: {formatCurrency(invoice.netAmount, invoice.currency)}</p>
                                  <p className="text-gray-900">MwSt. ({invoice.vatRate}%): {formatCurrency(invoice.vatAmount, invoice.currency)}</p>
                                  <p className="font-medium text-gray-900">Brutto: {formatCurrency(invoice.grossAmount, invoice.currency)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1">Fälligkeit</p>
                                  <p className="text-gray-900">Fällig bis: {formatDate(invoice.dueDate)}</p>
                                  {invoice.paidAt && <p className="text-green-600">Bezahlt am: {formatDate(invoice.paidAt)}</p>}
                                  {invoice.paymentMethod && <p className="text-gray-900">Zahlungsart: {invoice.paymentMethod}</p>}
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1">Zusatzinfo</p>
                                  {invoice.installmentNumber && (
                                    <p className="text-gray-900">Abschlag {invoice.installmentNumber} von {invoice.totalInstallments}</p>
                                  )}
                                  {invoice.notes && <p className="text-gray-600 text-xs mt-1">{invoice.notes}</p>}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Help Section */}
        <div className="bg-gradient-to-r from-[#00B4D8]/10 to-[#0096B4]/10 rounded-xl p-6 border border-[#00B4D8]/20">
          <h3 className="font-semibold text-gray-900 mb-2">Fragen zu Ihren Rechnungen?</h3>
          <p className="text-gray-600 text-sm mb-4">
            Bei Fragen zu Ihren Rechnungen oder Zahlungen können Sie uns jederzeit kontaktieren.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="mailto:info@non-dom.group" className="text-[#00B4D8] hover:underline">
              info@non-dom.group
            </a>
            <span className="text-gray-400">|</span>
            <a href="tel:+41800708044" className="text-[#00B4D8] hover:underline">
              0800 70 800 44
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
