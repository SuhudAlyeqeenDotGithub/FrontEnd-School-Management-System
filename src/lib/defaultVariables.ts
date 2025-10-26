export const allGroups = ["Administration", "Curriculum", "Staff", "Student"];
export const allTabs = [
  // Administration
  {
    tab: "Roles & Permission",
    group: "Administration",
    actions: [
      { action: "Create Role", permission: false },
      { action: "View Roles", permission: false },
      { action: "Edit Role", permission: false },
      { action: "Delete Role", permission: false }
    ]
  },
  {
    tab: "Users",
    group: "Administration",
    actions: [
      { action: "Create User", permission: false },
      { action: "View Users", permission: false },
      { action: "Edit User", permission: false },
      { action: "Delete User", permission: false }
    ]
  },
  {
    tab: "Activity Log",
    group: "Administration",
    actions: [
      { action: "Create Activity Log", permission: false },
      { action: "View Activity Logs", permission: false },
      { action: "Edit Activity Log", permission: false },
      { action: "Delete Activity Log", permission: false }
    ]
  },
  {
    tab: "Billing",
    group: "Administration",
    actions: [
      { action: "Create Billing", permission: false },
      { action: "View Billings", permission: false },
      { action: "Edit Billing", permission: false },
      { action: "Delete Billing", permission: false },
      { action: "Update Subscription", permission: false },
      { action: "View Subscriptions", permission: false },
      { action: "Update Failed Payments", permission: false },
      { action: "View Failed Payments", permission: false }
    ]
  },
  {
    tab: "Setting",
    group: "Administration",
    actions: [
      { action: "Update Settings", permission: false },
      { action: "Edit Organisation Profile", permission: false }
    ]
  },

  // Curriculum
  {
    tab: "Programme",
    group: "Curriculum",
    actions: [
      { action: "Create Programme", permission: false },
      { action: "View Programmes", permission: false },
      { action: "Edit Programme", permission: false },
      { action: "Delete Programme", permission: false },
      { action: "Create Programme Manager", permission: false },
      { action: "View Programme Managers", permission: false },
      { action: "Edit Programme Manager", permission: false },
      { action: "Delete Programme Manager", permission: false }
    ]
  },
  {
    tab: "Course",
    group: "Curriculum",
    actions: [
      { action: "Create Course", permission: false },
      { action: "View Courses", permission: false },
      { action: "Edit Course", permission: false },
      { action: "Delete Course", permission: false },
      { action: "Create Course Manager", permission: false },
      { action: "View Course Managers", permission: false },
      { action: "Edit Course Manager", permission: false },
      { action: "Delete Course Manager", permission: false }
    ]
  },
  {
    tab: "Level",
    group: "Curriculum",
    actions: [
      { action: "Create Level", permission: false },
      { action: "View Levels", permission: false },
      { action: "Edit Level", permission: false },
      { action: "Delete Level", permission: false },
      { action: "Create Level Manager", permission: false },
      { action: "View Level Managers", permission: false },
      { action: "Edit Level Manager", permission: false },
      { action: "Delete Level Manager", permission: false }
    ]
  },
  {
    tab: "Subject",
    group: "Curriculum",
    actions: [
      { action: "Create Base Subject", permission: false },
      { action: "View Base Subjects", permission: false },
      { action: "Edit Base Subject", permission: false },
      { action: "Delete Base Subject", permission: false },
      { action: "Create Base Subject Manager", permission: false },
      { action: "View Base Subject Managers", permission: false },
      { action: "Edit Base Subject Manager", permission: false },
      { action: "Delete Base Subject Manager", permission: false },
      { action: "Create Subject", permission: false },
      { action: "View Subjects", permission: false },
      { action: "Edit Subject", permission: false },
      { action: "Delete Subject", permission: false },
      { action: "Create Subject Teacher", permission: false },
      { action: "View Subject Teachers", permission: false },
      { action: "Edit Subject Teacher", permission: false },
      { action: "Delete Subject Teacher", permission: false }
    ]
  },
  {
    tab: "Learning Plan",
    group: "Curriculum",
    actions: [
      { action: "Create Syllabus", permission: false },
      { action: "View Syllabuses", permission: false },
      { action: "Edit Syllabus", permission: false },
      { action: "Delete Syllabus", permission: false },
      { action: "Create Topic", permission: false },
      { action: "View Topics", permission: false },
      { action: "Edit Topic", permission: false },
      { action: "Delete Topic", permission: false },
      { action: "Create Timetable", permission: false },
      { action: "View Timetables", permission: false },
      { action: "Edit Timetable", permission: false },
      { action: "Delete Timetable", permission: false }
    ]
  },
  {
    tab: "Academic Session",
    group: "Curriculum",
    actions: [
      { action: "Create Academic Year", permission: false },
      { action: "View Academic Years", permission: false },
      { action: "Edit Academic Year", permission: false },
      { action: "Delete Academic Year", permission: false },
      { action: "Create Period", permission: false },
      { action: "View Periods", permission: false },
      { action: "Edit Period", permission: false },
      { action: "Delete Period", permission: false }
    ]
  },
  {
    tab: "Location",
    group: "Curriculum",
    actions: [
      { action: "Create Location", permission: false },
      { action: "View Locations", permission: false },
      { action: "Edit Location", permission: false },
      { action: "Delete Location", permission: false }
    ]
  },

  // Staff
  {
    tab: "Staff Profile",
    group: "Staff",
    actions: [
      {
        action: "Create Staff Profile",
        permission: false
      },
      {
        action: "View Staff Profiles",
        permission: false
      },
      {
        action: "Edit Staff Profile",
        permission: false
      },
      {
        action: "Delete Staff Profile",
        permission: false
      }
    ]
  },
  {
    tab: "Staff Contract",
    group: "Staff",
    actions: [
      { action: "Create Staff Contract", permission: false },
      { action: "View Staff Contracts", permission: false },
      { action: "Edit Staff Contract", permission: false },
      { action: "Delete Staff Contract", permission: false }
    ]
  },

  // students

  {
    tab: "Student Attendance",
    group: "Student",
    actions: [
      { action: "View Student Day Attendances (Admin Access)", permission: false },
      { action: "View Student Day Attendances (For Level | Course Managers)", permission: false },

      { action: "Create Student Day Attendance (Admin Access)", permission: false },
      { action: "Create Student Day Attendance (For Level | Course Managers)", permission: false },

      { action: "Edit Student Day Attendance (Admin Access)", permission: false },
      { action: "Edit Student Day Attendance (For Level | Course Managers)", permission: false },

      { action: "Delete Student Day Attendance (Admin Access)", permission: false },
      { action: "Delete Student Day Attendance (For Level | Course Managers)", permission: false },

      { action: "View Student Event Attendances (Admin Access)", permission: false },
      { action: "View Student Event Attendances (For Level | Course Managers)", permission: false },

      { action: "Create Student Event Attendance (Admin Access)", permission: false },
      { action: "Create Student Event Attendance (For Level | Course Managers)", permission: false },

      { action: "Edit Student Event Attendance (Admin Access)", permission: false },
      { action: "Edit Student Event Attendance (For Level | Course Managers)", permission: false },

      { action: "Delete Student Event Attendance (Admin Access)", permission: false },
      { action: "Delete Student Event Attendance (For Level | Course Managers)", permission: false },

      { action: "View Student Subject Attendances (Admin Access)", permission: false },
      {
        action: "View Student Subject Attendances (For Level | Course Managers | Subject Teachers)",
        permission: false
      },

      { action: "Create Student Subject Attendance (Admin Access)", permission: false },
      {
        action: "Create Student Subject Attendance (For Level | Course Managers | Subject Teachers)",
        permission: false
      },

      { action: "Edit Student Subject Attendance (Admin Access)", permission: false },
      { action: "Edit Student Subject Attendance (For Level | Course Managers | Subject Teachers)", permission: false },

      { action: "Delete Student Subject Attendance (Admin Access)", permission: false },
      {
        action: "Delete Student Subject Attendance (For Level | Course Managers | Subject Teachers)",
        permission: false
      }
    ]
  },
  {
    tab: "Student Assessment",
    group: "Student",
    actions: [
      {
        action: "Create Student Assessment",
        permission: false
      },
      {
        action: "View Student Assessments",
        permission: false
      },
      {
        action: "Edit Student Assessment",
        permission: false
      },
      {
        action: "Delete Student Assessment",
        permission: false
      }
    ]
  },

  {
    tab: "Student Profile",
    group: "Student",
    actions: [
      {
        action: "Create Student Profile",
        permission: false
      },
      {
        action: "View Student Profiles",
        permission: false
      },
      {
        action: "Edit Student Profile",
        permission: false
      },
      {
        action: "Delete Student Profile",
        permission: false
      }
    ]
  },
  {
    tab: "Student Enrollment",
    group: "Student",
    actions: [
      { action: "Create Student Enrollment", permission: false },
      { action: "View Student Enrollment", permission: false },
      { action: "Edit Student Enrollment", permission: false },
      { action: "Delete Student Enrollment", permission: false }
    ]
  }
];
