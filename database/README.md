# Youth for Homeland NGO Database

This folder contains the relational database schema for **"شباب من أجل الوطن"** as an enterprise NGO system covering membership, departments, volunteers, management, committees, programs, projects, activities, finance, assets, partners, beneficiaries, users, roles, permissions, documents, correspondence, meetings, notifications, and audit logs.

## Files

- `youth_for_homeland_schema.sql` — MySQL 8+ DDL script that creates the `youth_for_homeland` database, all 31 requested tables, primary keys, foreign keys, unique constraints for junction tables, and helpful indexes.

## Main relationship groups

- `Departments` owns or organizes `Members`, `Managers`, `Committees`, `Projects`, `Activities`, `Assets`, and `Budgets`.
- `Members` links to volunteer profiles, managers, committee membership, activity participation and attendance, course participation, meeting attendance, and user accounts.
- `Programs` contains `Projects`.
- `Projects` contains `Activities`, `Expenses`, and beneficiary links.
- `Users`, `Roles`, and `Permissions` implement role-based access control.
- `Users` also links to notifications, audit logs, and uploaded documents.

## Usage

Run the schema with a MySQL 8+ client:

```bash
mysql -u <user> -p < database/youth_for_homeland_schema.sql
```
