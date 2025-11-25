import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, FileText, Download, LogOut, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BACKEND_URL } from "@/config";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 🔍 Search + Filters
  const [search, setSearch] = useState("");
  const [filterLoan, setFilterLoan] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");

    if (!token) {
      navigate("/admin/logout");
      return;
    }

    fetchApplications(token);
  }, []);

  const handleDelete = async (application) => {
    if (!confirm(`Are you sure you want to delete application ${application.name}?`)) return;

    try {
      const token = sessionStorage.getItem("admin_token");

      const res = await fetch(
        `${BACKEND_URL}/api/applications/${application._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON response:", text);
        throw new Error("Server returned HTML instead of JSON");
      }

      if (!res.ok) {
        toast({
          title: "Error",
          description: data.message || "Failed to delete application",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Deleted",
        description: `Application ${application._id} has been deleted`,
      });

      setApplications((prev) => prev.filter((app) => app._id !== application._id));
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Server not responding",
        variant: "destructive",
      });
    }
  };

  const fetchApplications = async (token) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        sessionStorage.removeItem("admin_token");
        navigate("/admin/login");
        return;
      }

      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_authenticated");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/admin/login");
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setIsDialogOpen(true);
  };

  const handleDownloadPDF = async (application) => {
    try {
      const token = sessionStorage.getItem("admin_token");

      const res = await fetch(
        `${BACKEND_URL}/api/applications/${application._id}/pdf`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `application_${application._id}.pdf`;
      a.click();

      toast({
        title: "PDF Downloaded",
        description: `Application ${application._id} PDF downloaded`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive",
      });
    }
  };

  const formatLoanCategory = (category) => {
    const categories = {
      personal: "Personal Loan",
      housing: "Housing Loan",
      business: "Business Loan",
      vehicle: "Vehicle Loan",
    };
    return categories[category] || category;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8 px-4">
      <div className="container max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage loan applications</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/admin/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{applications.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total loan applications received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {applications.filter(app => {
                  const today = new Date();
                  const submittedDate = new Date(app.submittedAt);
                  return today.toDateString() === submittedDate.toDateString();
                }).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Applications submitted today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 🔍 SEARCH & FILTERS */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border flex flex-col md:flex-row gap-4 items-center justify-between">

          {/* Search */}
          <input
            type="text"
            placeholder="Search by name or phone..."
            className="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex flex-wrap gap-3">

            {/* Loan Filter */}
            <select
              className="px-4 py-2 border rounded-lg"
              value={filterLoan}
              onChange={(e) => setFilterLoan(e.target.value)}
            >
              <option value="">All Loan Types</option>
              <option value="personal">Personal</option>
              <option value="housing">Housing</option>
              <option value="business">Business</option>
              <option value="vehicle">Vehicle</option>
            </select>

            {/* Gender Filter */}
            <select
              className="px-4 py-2 border rounded-lg"
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            {/* Date Filter */}
            

            {/* Reset */}
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setFilterLoan("");
                setFilterGender("");
    
              }}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Applications</CardTitle>
            <CardDescription>View and manage all loan applications</CardDescription>
          </CardHeader>

          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                <p className="text-muted-foreground">Applications will appear here once submitted</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {applications
                    .filter((app) => {
                      const s = search.toLowerCase();

                      if (
                        s &&
                        !app.name.toLowerCase().includes(s) &&
                        !app.phoneNumber.includes(s)
                      ) return false;

                      if (filterLoan && app.loanCategory !== filterLoan) return false;

                      if (filterGender && app.gender !== filterGender) return false;

                      if (filterDate) {
                        const d = new Date(app.submittedAt).toISOString().split("T")[0];
                        if (d !== filterDate) return false;
                      }

                      return true;
                    })
                    .map((app) => (
                      <TableRow key={app._id}>

                        <TableCell>{app.name}</TableCell>
                        <TableCell>{app.phoneNumber}</TableCell>
                        <TableCell>{formatLoanCategory(app.loanCategory)}</TableCell>
                        <TableCell>
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(app)}>
                              View Details
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(app)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(app)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>

                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* APPLICATION DETAILS MODAL */}

<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Application Details</DialogTitle>
      <DialogDescription>
        Complete information for application {selectedApplication?._id}
      </DialogDescription>
    </DialogHeader>

{selectedApplication && (
  <div className="space-y-4">

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      <div>
        <p className="text-sm font-medium text-muted-foreground">Full Name</p>
        <p>{selectedApplication.name}</p>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
        <p>{selectedApplication.phoneNumber}</p>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground">Primary Contact Number</p>
        <p>{selectedApplication.primaryContactNumber}</p>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground">Address</p>
        <p>{selectedApplication.address}</p>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
        <p>{new Date(selectedApplication.dateOfBirth).toLocaleDateString()}</p>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground">Gender</p>
        <p>{selectedApplication.gender}</p>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground">Loan Category</p>
        <p>{formatLoanCategory(selectedApplication.loanCategory)}</p>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground">Submitted At</p>
        <p>{new Date(selectedApplication.submittedAt).toLocaleString()}</p>
      </div>

      {/* Referral Info */}
      <div>
        <p className="text-sm font-medium text-muted-foreground">Referral Name</p>
        <p>{selectedApplication.referralName || "-"}</p>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground">Referral Phone</p>
        <p>{selectedApplication.referralPhone || "-"}</p>
      </div>

    </div>
  </div>
)}


  </DialogContent>
</Dialog>

    </div>
  );
}
