import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type DatabaseStatus = {
  configured: boolean;
  connected: boolean;
  database: string;
  host: string;
  error?: string;
};

type SchemaSummary = {
  database: string;
  tableCount: number;
  foreignKeyCount: number;
  tables: string[];
};

type DashboardSummary = {
  departmentCount: number;
  memberCount: number;
  projectCount: number;
  donationTotal: number;
  expenseTotal: number;
  activityCount: number;
  beneficiaryCount: number;
};

type Department = {
  DepartmentID: number;
  DepartmentName: string;
  Description?: string;
  Status: string;
  MemberCount: number;
};

type Member = {
  MemberID: number;
  FullName: string;
  Gender?: string;
  Phone?: string;
  Email?: string;
  Status: string;
  DepartmentName?: string;
};

type Project = {
  ProjectID: number;
  ProjectName: string;
  Budget: number | string;
  Status: string;
  DepartmentName?: string;
  ProgramName?: string;
  ProjectManager?: string;
};

type Donation = {
  DonationID: number;
  DonorName: string;
  DonorPhone?: string;
  Amount: number | string;
  Purpose?: string;
  PaymentMethod?: string;
  ReceiptNumber?: string;
};

const formatMoney = (value: number | string) =>
  new Intl.NumberFormat("ar", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value || 0));

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${response.status}`);
  }
  return response.json();
}

async function postJson(url: string, body: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Request failed: ${response.status}`);
  }
  return response.json();
}

function StatCard({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <article className={`stat-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function App() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [schema, setSchema] = useState<SchemaSummary | null>(null);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  const departmentOptions = useMemo(
    () => departments.map((department) => ({ id: department.DepartmentID, name: department.DepartmentName })),
    [departments],
  );

  async function load() {
    setLoading(true);
    setNotice("");
    const [databaseStatus, schemaSummary] = await Promise.all([
      getJson<DatabaseStatus>("/api/database/status"),
      getJson<SchemaSummary>("/api/database/schema"),
    ]);
    setStatus(databaseStatus);
    setSchema(schemaSummary);

    if (databaseStatus.connected) {
      const [summary, departmentRows, memberRows, projectRows, donationRows] = await Promise.all([
        getJson<DashboardSummary>("/api/dashboard"),
        getJson<Department[]>("/api/departments"),
        getJson<Member[]>("/api/members"),
        getJson<Project[]>("/api/projects"),
        getJson<Donation[]>("/api/donations"),
      ]);
      setDashboard(summary);
      setDepartments(departmentRows);
      setMembers(memberRows);
      setProjects(projectRows);
      setDonations(donationRows);
    }
    setLoading(false);
  }

  useEffect(() => {
    load().catch((error) => {
      setNotice(error.message);
      setLoading(false);
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>, endpoint: string, successMessage: string) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    await postJson(endpoint, data);
    form.reset();
    setNotice(successMessage);
    await load();
  }

  return (
    <main className="shell" dir="rtl">
      <section className="hero">
        <div>
          <p className="eyebrow">نظام إدارة مؤسسي متصل بقاعدة البيانات</p>
          <h1>منصة شباب من أجل الوطن</h1>
          <p>
            تطبيق ويب يستخدم مخطط قاعدة بيانات المنظمة لإدارة الأقسام والأعضاء والمشروعات والتبرعات مع لوحة متابعة فورية.
          </p>
        </div>
        <aside className={`db-status ${status?.connected ? "online" : "offline"}`}>
          <span>{status?.connected ? "متصل" : "غير متصل"}</span>
          <strong>{status?.database || "youth_for_homeland"}</strong>
          <small>{status?.host}</small>
        </aside>
      </section>

      {notice && <div className="notice">{notice}</div>}

      {status && !status.connected && (
        <section className="panel warning">
          <h2>تفعيل الاتصال بقاعدة MySQL</h2>
          <p>{status.error}</p>
          <code>DB_HOST=localhost DB_PORT=3306 DB_USER=root DB_PASSWORD=secret DB_NAME=youth_for_homeland npm run dev</code>
        </section>
      )}

      <section className="stats-grid">
        <StatCard label="الجداول" value={schema?.tableCount ?? "—"} tone="gold" />
        <StatCard label="العلاقات الخارجية" value={schema?.foreignKeyCount ?? "—"} tone="green" />
        <StatCard label="الأعضاء" value={dashboard?.memberCount ?? "—"} tone="blue" />
        <StatCard label="إجمالي التبرعات" value={dashboard ? formatMoney(dashboard.donationTotal) : "—"} tone="rose" />
      </section>

      <section className="grid two-columns">
        <article className="panel">
          <h2>إضافة قسم</h2>
          <form onSubmit={(event) => handleSubmit(event, "/api/departments", "تم حفظ القسم بنجاح.")}>
            <input name="DepartmentName" placeholder="اسم القسم" required />
            <textarea name="Description" placeholder="وصف القسم" />
            <select name="Status" defaultValue="Active">
              <option value="Active">نشط</option>
              <option value="Inactive">غير نشط</option>
            </select>
            <button disabled={!status?.connected}>حفظ القسم</button>
          </form>
        </article>

        <article className="panel">
          <h2>إضافة عضو</h2>
          <form onSubmit={(event) => handleSubmit(event, "/api/members", "تم حفظ العضو بنجاح.")}>
            <input name="FullName" placeholder="الاسم الكامل" required />
            <div className="form-row">
              <input name="Phone" placeholder="الهاتف" />
              <input name="Email" type="email" placeholder="البريد الإلكتروني" />
            </div>
            <select name="DepartmentID" defaultValue="">
              <option value="">بدون قسم</option>
              {departmentOptions.map((department) => (
                <option value={department.id} key={department.id}>{department.name}</option>
              ))}
            </select>
            <button disabled={!status?.connected}>حفظ العضو</button>
          </form>
        </article>

        <article className="panel">
          <h2>إضافة مشروع</h2>
          <form onSubmit={(event) => handleSubmit(event, "/api/projects", "تم حفظ المشروع بنجاح.")}>
            <input name="ProjectName" placeholder="اسم المشروع" required />
            <textarea name="Description" placeholder="وصف المشروع" />
            <div className="form-row">
              <select name="DepartmentID" defaultValue="">
                <option value="">القسم المنفذ</option>
                {departmentOptions.map((department) => (
                  <option value={department.id} key={department.id}>{department.name}</option>
                ))}
              </select>
              <input name="Budget" type="number" min="0" step="0.01" placeholder="الميزانية" />
            </div>
            <button disabled={!status?.connected}>حفظ المشروع</button>
          </form>
        </article>

        <article className="panel">
          <h2>تسجيل تبرع</h2>
          <form onSubmit={(event) => handleSubmit(event, "/api/donations", "تم تسجيل التبرع بنجاح.")}>
            <input name="DonorName" placeholder="اسم المتبرع" required />
            <div className="form-row">
              <input name="Amount" type="number" min="0" step="0.01" placeholder="المبلغ" required />
              <input name="PaymentMethod" placeholder="طريقة الدفع" />
            </div>
            <input name="ReceiptNumber" placeholder="رقم الإيصال" />
            <button disabled={!status?.connected}>حفظ التبرع</button>
          </form>
        </article>
      </section>

      <section className="grid two-columns">
        <DataList title="الأقسام" empty="لا توجد أقسام بعد" loading={loading}>
          {departments.map((department) => (
            <li key={department.DepartmentID}>
              <strong>{department.DepartmentName}</strong>
              <span>{department.MemberCount} عضو · {department.Status}</span>
            </li>
          ))}
        </DataList>

        <DataList title="آخر الأعضاء" empty="لا يوجد أعضاء بعد" loading={loading}>
          {members.map((member) => (
            <li key={member.MemberID}>
              <strong>{member.FullName}</strong>
              <span>{member.DepartmentName || "بدون قسم"} · {member.Phone || member.Email || "لا توجد بيانات اتصال"}</span>
            </li>
          ))}
        </DataList>

        <DataList title="المشروعات" empty="لا توجد مشروعات بعد" loading={loading}>
          {projects.map((project) => (
            <li key={project.ProjectID}>
              <strong>{project.ProjectName}</strong>
              <span>{project.DepartmentName || "بدون قسم"} · {formatMoney(project.Budget)} · {project.Status}</span>
            </li>
          ))}
        </DataList>

        <DataList title="التبرعات" empty="لا توجد تبرعات بعد" loading={loading}>
          {donations.map((donation) => (
            <li key={donation.DonationID}>
              <strong>{donation.DonorName}</strong>
              <span>{formatMoney(donation.Amount)} · {donation.PaymentMethod || "غير محدد"}</span>
            </li>
          ))}
        </DataList>
      </section>

      <section className="panel schema-panel">
        <h2>جداول قاعدة البيانات المستخدمة</h2>
        <div className="table-cloud">
          {schema?.tables.map((table) => <span key={table}>{table}</span>)}
        </div>
      </section>
    </main>
  );
}

function DataList({ title, empty, loading, children }: { title: string; empty: string; loading: boolean; children: React.ReactNode }) {
  const hasChildren = React.Children.count(children) > 0;

  return (
    <article className="panel list-panel">
      <h2>{title}</h2>
      {loading ? <p className="muted">جاري التحميل...</p> : null}
      {!loading && !hasChildren ? <p className="muted">{empty}</p> : null}
      {hasChildren ? <ul>{children}</ul> : null}
    </article>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
