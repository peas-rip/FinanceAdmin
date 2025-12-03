import { useEffect, useState } from "react";
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
import { Download, LogOut, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BACKEND_URL } from "@/config";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token) return navigate("/admin/login");

    fetchApplications(token);
  }, []);

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
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    toast({
      title: "Logged Out",
      description: "You have been logged out.",
    });
    navigate("/admin/login");
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setIsDialogOpen(true);
  };

  const handleDelete = async (application) => {
    if (!confirm(`Delete application from ${application.name}?`)) return;

    try {
      const token = sessionStorage.getItem("admin_token");
      const res = await fetch(
        `${BACKEND_URL}/api/applications/${application._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        toast({
          title: "Error",
          description: "Failed to delete",
          variant: "destructive",
        });
        return;
      }

      setApplications((prev) =>
        prev.filter((app) => app._id !== application._id)
      );

      setIsDialogOpen(false);

      toast({ title: "Deleted", description: "Application removed." });
    } catch {
      toast({
        title: "Error",
        description: "Server not responding",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async (application) => {
    try {
      const token = sessionStorage.getItem("admin_token");

      const res = await fetch(
        `${BACKEND_URL}/api/applications/${application._id}/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `application_${application._id}.pdf`;
      a.click();
    } catch {
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
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

        {/* APPLICATIONS TABLE */}
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
                {applications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan="5" className="text-center py-6">
                      No applications found
                    </TableCell>
                  </TableRow>
                )}

                {applications.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell>{app.name}</TableCell>
                    <TableCell>{app.phoneNumber}</TableCell>
                    <TableCell>{app.loanCategory}</TableCell>
                    <TableCell>
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(app)}
                      >
                        View
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPDF(app)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(app)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>

      {/* VIEW DETAILS MODAL */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Complete details of the applicant.
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

              <div className="col-span-2 flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadPDF(selectedApplication)}
                >
                  <Download className="h-4 w-4 mr-2" /> PDF
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedApplication)}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
