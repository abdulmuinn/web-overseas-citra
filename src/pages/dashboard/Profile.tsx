import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next";

type Profile = Tables<"profiles">;

const Profile = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
  const userRes = await supabase.auth.getUser();
  const user = userRes.data?.user;
  if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
  toast.error(t("profile.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          target_country: profile.target_country,
          education_level: profile.education_level,
          experience_years: profile.experience_years,
          languages: profile.languages,
        })
        .eq("id", profile.id);

      if (error) throw error;
  toast.success(t("profile.updateSuccess"));
    } catch (error) {
      console.error("Error updating profile:", error);
  toast.error(t("profile.updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>{t("common.loading")}</div>;
  }

  if (!profile) {
    return <div>{t("profile.notFound")}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
  <h1 className="text-3xl font-bold mb-6">{t("profile.title")}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.personalInfo.title")}</CardTitle>
          <CardDescription>{t("profile.personalInfo.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">{t("profile.fullName")}</Label>
                <Input
                  id="full_name"
                  value={profile.full_name || ""}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder={t("profile.fullNamePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("profile.email")}</Label>
                <Input id="email" value={profile.email} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("profile.phone")}</Label>
                <Input
                  id="phone"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder={t("profile.phonePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_country">{t("profile.targetCountry")}</Label>
                <Input
                  id="target_country"
                  value={profile.target_country || ""}
                  onChange={(e) => setProfile({ ...profile, target_country: e.target.value })}
                  placeholder={t("profile.targetCountryPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education_level">{t("profile.educationLevel")}</Label>
                <Input
                  id="education_level"
                  value={profile.education_level || ""}
                  onChange={(e) => setProfile({ ...profile, education_level: e.target.value })}
                  placeholder={t("profile.educationLevelPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_years">{t("profile.experienceYears")}</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  value={profile.experience_years || 0}
                  onChange={(e) => setProfile({ ...profile, experience_years: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages">{t("profile.languages")}</Label>
              <Input
                id="languages"
                value={profile.languages?.join(", ") || ""}
                onChange={(e) => setProfile({ ...profile, languages: e.target.value.split(",").map(l => l.trim()) })}
                placeholder={t("profile.languagesPlaceholder")}
              />
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? t("common.saving") : t("profile.saveChanges")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
