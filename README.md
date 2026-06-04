<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/19d5d0d1-5c67-4861-839e-bf04d384e5d7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
## Database schema

The repository includes a MySQL 8+ database schema for **شباب من أجل الوطن** in `database/youth_for_homeland_schema.sql`. It creates the full 31-table enterprise NGO model covering departments, members, volunteers, managers, committees, programs, projects, activities, finance, assets, partners, beneficiaries, users, roles, permissions, documents, correspondence, meetings, notifications, and audit logs.

Run it with:

```bash
mysql -u <user> -p < database/youth_for_homeland_schema.sql
```

