import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, LogOut, Settings, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BACKEND_URL } from "@/config";

const PAGE_SIZE = 20;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterLoanCategory, setFilterLoanCategory] = useState("");
  const [last7DaysOnly, setLast7DaysOnly] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [storage, setStorage] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token) return navigate("/admin/login");

    fetchApplications(token);
    fetchStorageStatus(token);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterLoanCategory, last7DaysOnly]);

  const fetchApplications = async (token) => {
    try {
      const res = await fetch(`${BACKEND_URL}/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        sessionStorage.removeItem("admin_token");
        navigate("/admin/login");
        return;
      }

      setApplications(await res.json());
    } catch {
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    }
  };

  const fetchStorageStatus = async (token) => {
    try {
      const res = await fetch(`${BACKEND_URL}/storage-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setStorage(await res.json());
    } catch {}
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    toast({ title: "Logged out successfully" });
    navigate("/admin/login");
  };

  const handleViewDetails = (app) => {
    setSelectedApplication(app);
    setIsDialogOpen(true);
  };

  const handleDelete = async (app) => {
    if (!confirm(`Delete application from ${app.name}?`)) return;

    try {
      const token = sessionStorage.getItem("admin_token");
      const res = await fetch(
        `${BACKEND_URL}/applications/${app._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error();

      setApplications((prev) => prev.filter((a) => a._id !== app._id));
      setIsDialogOpen(false);
      toast({ title: "Application deleted" });
    } catch {
      toast({
        title: "Error",
        description: "Delete failed",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async (app) => {
    try {
      const token = sessionStorage.getItem("admin_token");
      const res = await fetch(
        `${BACKEND_URL}/applications/${app._id}/pdf`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `application_${app._id}.pdf`;
      a.click();
    } catch {
      toast({
        title: "Error",
        description: "PDF download failed",
        variant: "destructive",
      });
    }
  };

  // ✅ FILTERING
  const filteredApplications = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    return applications.filter((app) => {
      const matchesName = app.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesLoan =
        !filterLoanCategory || app.loanCategory === filterLoanCategory;

      const matchesLast7Days =
        !last7DaysOnly ||
        new Date(app.submittedAt) >= sevenDaysAgo;

      return matchesName && matchesLoan && matchesLast7Days;
    });
  }, [applications, searchTerm, filterLoanCategory, last7DaysOnly]);

  // ✅ PAGINATION
  const totalPages = Math.ceil(filteredApplications.length / PAGE_SIZE);

  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredApplications.slice(start, start + PAGE_SIZE);
  }, [filteredApplications, currentPage]);

  const loanCategories = useMemo(
    () => [...new Set(applications.map((a) => a.loanCategory))],
    [applications]
  );

  const storageColor =
    storage?.status === "critical"
      ? "bg-red-500"
      : storage?.status === "warning"
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/admin/settings")}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        {/* STORAGE CARD */}
        {storage && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Database Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div
                  className={`h-3 rounded-full ${storageColor}`}
                  style={{ width: `${storage.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  {storage.usedDocuments.toLocaleString()} /{" "}
                  {storage.maxDocuments.toLocaleString()} records
                </span>
                <span className="capitalize font-medium">
                  {storage.status}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Search by name..."
            className="border rounded px-3 py-2 w-full sm:w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="border rounded px-3 py-2 w-full sm:w-1/3"
            value={filterLoanCategory}
            onChange={(e) => setFilterLoanCategory(e.target.value)}
          >
            <option value="">All Loan Categories</option>
            {loanCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={last7DaysOnly}
              onChange={(e) => setLast7DaysOnly(e.target.checked)}
            />
            Last 7 days
          </label>
        </div>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Loan Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Loan</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedApplications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan="5" className="text-center py-6">
                      No applications found
                    </TableCell>
                  </TableRow>
                )}

                {paginatedApplications.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell>{app.name}</TableCell>
                    <TableCell>{app.phoneNumber}</TableCell>
                    <TableCell>{app.loanCategory}</TableCell>
                    <TableCell>
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewDetails(app)}>
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(app)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(app)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </Button>

                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* DETAILS MODAL (UNCHANGED) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Complete applicant information
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {[
                ["Full Name", selectedApplication.name],
                ["Phone Number", selectedApplication.phoneNumber],
                ["Primary Contact", selectedApplication.primaryContactNumber],
                ["Gender", selectedApplication.gender],
                ["DOB", selectedApplication.dateOfBirth],
                ["Loan Category", selectedApplication.loanCategory],
                ["Loan Category Other", selectedApplication.loanCategoryOther],
                ["Address", selectedApplication.address],
                ["Referral Name 1", selectedApplication.referralName1],
                ["Referral Phone 1", selectedApplication.referralPhone1],
                ["Referral Name 2", selectedApplication.referralName2],
                ["Referral Phone 2", selectedApplication.referralPhone2],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="font-medium">{value || "-"}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
