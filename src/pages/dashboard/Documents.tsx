import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Upload, Trash2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface Document {
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

const Documents = () => {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
  const userRes = await supabase.auth.getUser();
  const user = userRes.data?.user;
  if (!user) return;

  setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("documents")
        .eq("id", user.id)
        .single();

      if (profile?.documents && Array.isArray(profile.documents)) {
        setDocuments(profile.documents as unknown as Document[]);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
  toast.error(t("documents.fileTooLarge"));
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(fileName);

      const newDoc: Document = {
        name: file.name,
        type,
        url: fileName,
        uploadedAt: new Date().toISOString(),
      };

      const updatedDocs = [...documents, newDoc];
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ documents: updatedDocs as unknown as any })
        .eq("id", userId);

      if (updateError) throw updateError;

      setDocuments(updatedDocs);
  toast.success(t("documents.uploadSuccess"));
    } catch (error) {
      console.error("Error uploading file:", error);
  toast.error(t("documents.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docUrl: string) => {
    try {
      const { error: deleteError } = await supabase.storage
        .from("documents")
        .remove([docUrl]);

      if (deleteError) throw deleteError;

      const updatedDocs = documents.filter(doc => doc.url !== docUrl);
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ documents: updatedDocs as unknown as any })
        .eq("id", userId);

      if (updateError) throw updateError;

      setDocuments(updatedDocs);
  toast.success(t("documents.deleteSuccess"));
    } catch (error) {
      console.error("Error deleting document:", error);
  toast.error(t("documents.deleteFailed"));
    }
  };

  const handleDownload = async (docUrl: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .download(docUrl);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
  toast.error(t("documents.downloadFailed"));
    }
  };

  const documentTypes = [
    { id: "cv", label: t("documents.types.cv"), accept: ".pdf,.doc,.docx" },
    { id: "passport", label: t("documents.types.passport"), accept: ".pdf,.jpg,.jpeg,.png" },
    { id: "certificate", label: t("documents.types.certificate"), accept: ".pdf,.jpg,.jpeg,.png" },
    { id: "diploma", label: t("documents.types.diploma"), accept: ".pdf,.jpg,.jpeg,.png" },
    { id: "other", label: t("documents.types.other"), accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
  <h1 className="text-3xl font-bold mb-6">{t("documents.title")}</h1>

      <div className="grid gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t("documents.uploadTitle")}</CardTitle>
              <CardDescription>{t("documents.uploadDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {documentTypes.map((docType) => (
              <div key={docType.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor={docType.id} className="cursor-pointer">{docType.label}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id={docType.id}
                    type="file"
                    accept={docType.accept}
                    onChange={(e) => handleFileUpload(e, docType.id)}
                    disabled={uploading}
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" onClick={() => document.getElementById(docType.id)?.click()} disabled={uploading}>
                    <Upload className="h-4 w-4 mr-2" />
                    {t("documents.uploadButton")}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>{t("documents.savedTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t("documents.empty")}</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                          <span className="text-xs text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString("id-ID")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(doc.url, doc.name)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.url)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Documents;
