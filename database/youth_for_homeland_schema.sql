-- Database schema for "شباب من أجل الوطن" (Youth for Homeland)
-- Target dialect: MySQL 8+
-- Charset/collation support Arabic names and content.

CREATE DATABASE IF NOT EXISTS youth_for_homeland
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE youth_for_homeland;

CREATE TABLE IF NOT EXISTS Departments (
  DepartmentID INT AUTO_INCREMENT PRIMARY KEY,
  DepartmentName VARCHAR(100) NOT NULL,
  Description TEXT,
  CreationDate DATE,
  Status VARCHAR(20) NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Members (
  MemberID INT AUTO_INCREMENT PRIMARY KEY,
  FullName VARCHAR(150) NOT NULL,
  Gender VARCHAR(10),
  DateOfBirth DATE,
  Phone VARCHAR(20),
  Email VARCHAR(100),
  Address VARCHAR(255),
  JoinDate DATE,
  DepartmentID INT,
  Status VARCHAR(20) NOT NULL DEFAULT 'Active',
  CONSTRAINT fk_members_department
    FOREIGN KEY (DepartmentID) REFERENCES Departments(DepartmentID)
    ON UPDATE CASCADE ON DELETE SET NULL,
  UNIQUE KEY uq_members_email (Email),
  KEY idx_members_department (DepartmentID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Volunteers (
  VolunteerID INT AUTO_INCREMENT PRIMARY KEY,
  MemberID INT NOT NULL,
  Skills TEXT,
  Availability VARCHAR(100),
  Experience TEXT,
  CONSTRAINT fk_volunteers_member
    FOREIGN KEY (MemberID) REFERENCES Members(MemberID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY uq_volunteers_member (MemberID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Managers (
  ManagerID INT AUTO_INCREMENT PRIMARY KEY,
  MemberID INT NOT NULL,
  DepartmentID INT,
  Position VARCHAR(100),
  AppointmentDate DATE,
  EndDate DATE,
  Responsibilities TEXT,
  Status VARCHAR(20) NOT NULL DEFAULT 'Active',
  CONSTRAINT fk_managers_member
    FOREIGN KEY (MemberID) REFERENCES Members(MemberID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_managers_department
    FOREIGN KEY (DepartmentID) REFERENCES Departments(DepartmentID)
    ON UPDATE CASCADE ON DELETE SET NULL,
  KEY idx_managers_member (MemberID),
  KEY idx_managers_department (DepartmentID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Committees (
  CommitteeID INT AUTO_INCREMENT PRIMARY KEY,
  CommitteeName VARCHAR(150) NOT NULL,
  Description TEXT,
  DepartmentID INT,
  CreationDate DATE,
  CONSTRAINT fk_committees_department
    FOREIGN KEY (DepartmentID) REFERENCES Departments(DepartmentID)
    ON UPDATE CASCADE ON DELETE SET NULL,
  KEY idx_committees_department (DepartmentID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS CommitteeMembers (
  CommitteeMemberID INT AUTO_INCREMENT PRIMARY KEY,
  CommitteeID INT NOT NULL,
  MemberID INT NOT NULL,
  Role VARCHAR(100),
  CONSTRAINT fk_committee_members_committee
    FOREIGN KEY (CommitteeID) REFERENCES Committees(CommitteeID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_committee_members_member
    FOREIGN KEY (MemberID) REFERENCES Members(MemberID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY uq_committee_membership (CommitteeID, MemberID),
  KEY idx_committee_members_member (MemberID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Programs (
  ProgramID INT AUTO_INCREMENT PRIMARY KEY,
  ProgramName VARCHAR(150) NOT NULL,
  Description TEXT,
  StartDate DATE,
  EndDate DATE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Projects (
  ProjectID INT AUTO_INCREMENT PRIMARY KEY,
  ProgramID INT,
  DepartmentID INT,
  ProjectManagerID INT,
  ProjectName VARCHAR(150) NOT NULL,
  Description TEXT,
  StartDate DATE,
  EndDate DATE,
  Budget DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  Status VARCHAR(50) NOT NULL DEFAULT 'Planned',
  CONSTRAINT fk_projects_program
    FOREIGN KEY (ProgramID) REFERENCES Programs(ProgramID)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_projects_department
    FOREIGN KEY (DepartmentID) REFERENCES Departments(DepartmentID)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_projects_manager
    FOREIGN KEY (ProjectManagerID) REFERENCES Managers(ManagerID)
    ON UPDATE CASCADE ON DELETE SET NULL,
  KEY idx_projects_program (ProgramID),
  KEY idx_projects_department (DepartmentID),
  KEY idx_projects_manager (ProjectManagerID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Activities (
  ActivityID INT AUTO_INCREMENT PRIMARY KEY,
  ProjectID INT,
  OrganizerDepartmentID INT,
  ActivityName VARCHAR(150) NOT NULL,
  ActivityDate DATE,
  Location VARCHAR(200),
  Description TEXT,
  Budget DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  ExpectedParticipants INT,
  CONSTRAINT fk_activities_project
    FOREIGN KEY (ProjectID) REFERENCES Projects(ProjectID)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_activities_organizer_department
    FOREIGN KEY (OrganizerDepartmentID) REFERENCES Departments(DepartmentID)
    ON UPDATE CASCADE ON DELETE SET NULL,
  KEY idx_activities_project (ProjectID),
  KEY idx_activities_organizer_department (OrganizerDepartmentID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ActivityParticipants (
  ParticipationID INT AUTO_INCREMENT PRIMARY KEY,
  ActivityID INT NOT NULL,
  MemberID INT NOT NULL,
  Role VARCHAR(100),
  Attendance BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_activity_participants_activity
    FOREIGN KEY (ActivityID) REFERENCES Activities(ActivityID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_activity_participants_member
    FOREIGN KEY (MemberID) REFERENCES Members(MemberID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY uq_activity_participation (ActivityID, MemberID),
  KEY idx_activity_participants_member (MemberID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ActivityAttendance (
  AttendanceID INT AUTO_INCREMENT PRIMARY KEY,
  ActivityID INT NOT NULL,
  MemberID INT NOT NULL,
  CheckInTime DATETIME,
  Status VARCHAR(50) NOT NULL DEFAULT 'Present',
  CONSTRAINT fk_activity_attendance_activity
    FOREIGN KEY (ActivityID) REFERENCES Activities(ActivityID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_activity_attendance_member
    FOREIGN KEY (MemberID) REFERENCES Members(MemberID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY uq_activity_attendance (ActivityID, MemberID),
  KEY idx_activity_attendance_member (MemberID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS TrainingCourses (
  CourseID INT AUTO_INCREMENT PRIMARY KEY,
  CourseName VARCHAR(150) NOT NULL,
  Trainer VARCHAR(150),
  StartDate DATE,
  EndDate DATE,
  Location VARCHAR(150)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS CourseParticipants (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  CourseID INT NOT NULL,
  MemberID INT NOT NULL,
  Result VARCHAR(100),
  CertificateIssued BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_course_participants_course
    FOREIGN KEY (CourseID) REFERENCES TrainingCourses(CourseID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_course_participants_member
    FOREIGN KEY (MemberID) REFERENCES Members(MemberID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY uq_course_participation (CourseID, MemberID),
  KEY idx_course_participants_member (MemberID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Donations (
  DonationID INT AUTO_INCREMENT PRIMARY KEY,
  DonorName VARCHAR(150) NOT NULL,
  DonorPhone VARCHAR(20),
  Amount DECIMAL(18,2) NOT NULL,
  DonationDate DATE,
  Purpose TEXT,
  PaymentMethod VARCHAR(50),
  ReceiptNumber VARCHAR(50),
  UNIQUE KEY uq_donations_receipt_number (ReceiptNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Expenses (
  ExpenseID INT AUTO_INCREMENT PRIMARY KEY,
  ProjectID INT,
  Amount DECIMAL(18,2) NOT NULL,
  ExpenseDate DATE,
  Description TEXT,
  ApprovedBy INT,
  ReceiptFile VARCHAR(255),
  CONSTRAINT fk_expenses_project
    FOREIGN KEY (ProjectID) REFERENCES Projects(ProjectID)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_expenses_approved_by
    FOREIGN KEY (ApprovedBy) REFERENCES Members(MemberID)
    ON UPDATE CASCADE ON DELETE SET NULL,
  KEY idx_expenses_project (ProjectID),
  KEY idx_expenses_approved_by (ApprovedBy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Budgets (
  BudgetID INT AUTO_INCREMENT PRIMARY KEY,
  DepartmentID INT NOT NULL,
  FiscalYear YEAR NOT NULL,
  Amount DECIMAL(18,2) NOT NULL,
  CONSTRAINT fk_budgets_department
    FOREIGN KEY (DepartmentID) REFERENCES Departments(DepartmentID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY uq_budgets_department_year (DepartmentID, FiscalYear)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Assets (
  AssetID INT AUTO_INCREMENT PRIMARY KEY,
  AssetName VARCHAR(150) NOT NULL,
  PurchaseDate DATE,
  Cost DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  DepartmentID INT,
  Status VARCHAR(50) NOT NULL DEFAULT 'Available',
  CONSTRAINT fk_assets_department
    FOREIGN KEY (DepartmentID) REFERENCES Departments(DepartmentID)
    ON UPDATE CASCADE ON DELETE SET NULL,
  KEY idx_assets_department (DepartmentID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Partners (
  PartnerID INT AUTO_INCREMENT PRIMARY KEY,
  PartnerName VARCHAR(150) NOT NULL,
  ContactPerson VARCHAR(150),
  Phone VARCHAR(20),
  Email VARCHAR(100),
  PartnershipType VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Beneficiaries (
  BeneficiaryID INT AUTO_INCREMENT PRIMARY KEY,
  FullName VARCHAR(150) NOT NULL,
  Phone VARCHAR(20),
  Address VARCHAR(255),
  Gender VARCHAR(10),
  Age INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ProjectBeneficiaries (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  ProjectID INT NOT NULL,
  BeneficiaryID INT NOT NULL,
  CONSTRAINT fk_project_beneficiaries_project
    FOREIGN KEY (ProjectID) REFERENCES Projects(ProjectID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_project_beneficiaries_beneficiary
    FOREIGN KEY (BeneficiaryID) REFERENCES Beneficiaries(BeneficiaryID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY uq_project_beneficiary (ProjectID, BeneficiaryID),
  KEY idx_project_beneficiaries_beneficiary (BeneficiaryID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Users (
  UserID INT AUTO_INCREMENT PRIMARY KEY,
  Username VARCHAR(100) NOT NULL,
  PasswordHash VARCHAR(255) NOT NULL,
  MemberID INT,
  Status VARCHAR(20) NOT NULL DEFAULT 'Active',
  CONSTRAINT fk_users_member
    FOREIGN KEY (MemberID) REFERENCES Members(MemberID)
    ON UPDATE CASCADE ON DELETE SET NULL,
  UNIQUE KEY uq_users_username (Username),
  UNIQUE KEY uq_users_member (MemberID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Roles (
  RoleID INT AUTO_INCREMENT PRIMARY KEY,
  RoleName VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_roles_role_name (RoleName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS UserRoles (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  UserID INT NOT NULL,
  RoleID INT NOT NULL,
  CONSTRAINT fk_user_roles_user
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY uq_user_role (UserID, RoleID),
  KEY idx_user_roles_role (RoleID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Permissions (
  PermissionID INT AUTO_INCREMENT PRIMARY KEY,
  PermissionName VARCHAR(150) NOT NULL,
  UNIQUE KEY uq_permissions_permission_name (PermissionName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS RolePermissions (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  RoleID INT NOT NULL,
  PermissionID INT NOT NULL,
  CONSTRAINT fk_role_permissions_role
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_permission
    FOREIGN KEY (PermissionID) REFERENCES Permissions(PermissionID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY uq_role_permission (RoleID, PermissionID),
  KEY idx_role_permissions_permission (PermissionID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Documents (
  DocumentID INT AUTO_INCREMENT PRIMARY KEY,
  Title VARCHAR(200) NOT NULL,
  Category VARCHAR(100),
  FilePath VARCHAR(255) NOT NULL,
  UploadDate DATETIME,
  UploadedBy INT,
  CONSTRAINT fk_documents_uploaded_by
    FOREIGN KEY (UploadedBy) REFERENCES Users(UserID)
    ON UPDATE CASCADE ON DELETE SET NULL,
  KEY idx_documents_uploaded_by (UploadedBy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Correspondence (
  LetterID INT AUTO_INCREMENT PRIMARY KEY,
  LetterNumber VARCHAR(50) NOT NULL,
  Direction VARCHAR(20),
  Subject VARCHAR(255) NOT NULL,
  DateSent DATE,
  SenderReceiver VARCHAR(255),
  UNIQUE KEY uq_correspondence_letter_number (LetterNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Meetings (
  MeetingID INT AUTO_INCREMENT PRIMARY KEY,
  Title VARCHAR(200) NOT NULL,
  MeetingDate DATETIME,
  Location VARCHAR(200),
  Minutes LONGTEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS MeetingAttendance (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  MeetingID INT NOT NULL,
  MemberID INT NOT NULL,
  CONSTRAINT fk_meeting_attendance_meeting
    FOREIGN KEY (MeetingID) REFERENCES Meetings(MeetingID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_meeting_attendance_member
    FOREIGN KEY (MemberID) REFERENCES Members(MemberID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY uq_meeting_attendance (MeetingID, MemberID),
  KEY idx_meeting_attendance_member (MemberID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Notifications (
  NotificationID INT AUTO_INCREMENT PRIMARY KEY,
  UserID INT NOT NULL,
  Message TEXT NOT NULL,
  DateCreated DATETIME,
  IsRead BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
    ON UPDATE CASCADE ON DELETE CASCADE,
  KEY idx_notifications_user (UserID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS AuditLogs (
  LogID INT AUTO_INCREMENT PRIMARY KEY,
  UserID INT,
  ActionType VARCHAR(100) NOT NULL,
  TableName VARCHAR(100) NOT NULL,
  RecordID INT,
  ActionDate DATETIME,
  CONSTRAINT fk_audit_logs_user
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
    ON UPDATE CASCADE ON DELETE SET NULL,
  KEY idx_audit_logs_user (UserID),
  KEY idx_audit_logs_record (TableName, RecordID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
