import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface ApplicationsByStatus {
  status: string;
  count: number;
}

interface JobApplicationStats {
  job_title: string;
  application_count: number;
}

interface MatchScoreStats {
  range: string;
  count: number;
}

interface CountryStats {
  country: string;
  count: number;
}

interface CategoryStats {
  category: string;
  count: number;
}

const Reports = () => {
  const { t } = useTranslation();
  const [statusData, setStatusData] = useState<ApplicationsByStatus[]>([]);
  const [jobStats, setJobStats] = useState<JobApplicationStats[]>([]);
  const [matchScoreData, setMatchScoreData] = useState<MatchScoreStats[]>([]);
  const [countryData, setCountryData] = useState<CountryStats[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      // Fetch applications by status
      const { data: applications, error: appError } = await supabase
        .from("applications")
        .select("status, match_score");

      if (appError) throw appError;

      const statusCounts = applications.reduce((acc: Record<string, number>, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {});

      const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count: count as number,
      }));

      setStatusData(statusChartData);

      // Match score distribution
      const scoreRanges = {
        "0-30": 0,
        "31-50": 0,
        "51-70": 0,
        "71-85": 0,
        "86-100": 0,
      };

      applications.forEach((app) => {
        const score = app.match_score || 0;
        if (score <= 30) scoreRanges["0-30"]++;
        else if (score <= 50) scoreRanges["31-50"]++;
        else if (score <= 70) scoreRanges["51-70"]++;
        else if (score <= 85) scoreRanges["71-85"]++;
        else scoreRanges["86-100"]++;
      });

      const matchScoreChartData = Object.entries(scoreRanges).map(([range, count]) => ({
        range,
        count,
      }));

      setMatchScoreData(matchScoreChartData);

      // Fetch applications per job
      const { data: jobApps, error: jobError } = await supabase
        .from("applications")
        .select(`
          job_id,
          jobs:job_id (
            title
          )
        `);

      if (jobError) throw jobError;

      const jobCounts = jobApps.reduce((acc: Record<string, { title: string; count: number }>, app: any) => {
        const jobId = app.job_id;
        const jobTitle = app.jobs?.title || "Unknown";
        
        if (!acc[jobId]) {
          acc[jobId] = { title: jobTitle, count: 0 };
        }
        acc[jobId].count++;
        return acc;
      }, {});

      const jobStatsData = Object.values(jobCounts).map(job => ({
        job_title: job.title,
        application_count: job.count,
      }));

      setJobStats(jobStatsData.slice(0, 10)); // Top 10 jobs

      // Fetch applicants by country
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("target_country");

      if (profileError) throw profileError;

      const countryCounts = profiles.reduce((acc: Record<string, number>, profile) => {
        const country = profile.target_country || "Belum Ditentukan";
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {});

      const countryChartData = Object.entries(countryCounts).map(([country, count]) => ({
        country,
        count: count as number,
      }));

      setCountryData(countryChartData);

      // Fetch jobs by category
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("category");

      if (jobsError) throw jobsError;

      const categoryCounts = jobs.reduce((acc: Record<string, number>, job) => {
        acc[job.category] = (acc[job.category] || 0) + 1;
        return acc;
      }, {});

      const categoryChartData = Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count: count as number,
      }));

      setCategoryData(categoryChartData);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  if (loading) {
    return <div>{t('reports.loading')}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t('reports.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('reports.matchScoreDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={matchScoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('reports.applicationStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('reports.topJobs')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jobStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="job_title" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="application_count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('reports.applicantsByCountry')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={countryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ country, count }) => `${country}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {countryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('reports.popularPositions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
