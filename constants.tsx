import { Course, Value, TeamMember, NewsletterPost } from './types';

export const COURSES: Course[] = [
  {
    id: 1,
    title: "Occupational Certificate: Automotive Engine Repairer",
    short_title: "Automotive Engine Repairer",
    description: "Specialized training program focused on automotive engine fitting, assembly, and repair. Students learn engine diagnosis, component fitting, assembly techniques, and testing procedures for various engine types.",
    short_description: "Become a certified automotive engine fitter with specialized training",
    duration: "36 months",
    credits: 540,
    deposit_amount: 6612.50,
    monthly_payment: 5514.83,
    total_payment: 140290.80,
    assessment_fee: 661.25,
    fee: 140290.80,
    registration_fee: 661.25,
    level: "beginner",
    curriculum: "Module 1: Engine Fundamentals\n- Engine types and classifications\n- Engine components and functions\n- Engine measurement and specifications\n\nModule 2: Engine Disassembly\n- Safe disassembly procedures\n- Component identification\n- Damage assessment\n\nModule 3: Engine Assembly\n- Component fitting techniques\n- Torque specifications\n- Clearance measurements\n\nModule 4: Engine Testing\n- Compression testing\n- Leak-down testing\n- Performance evaluation",
    prerequisites: "Basic understanding of mechanical systems. Interest in engine technology.",
    requirements: "Grade 12 with Mathematics/Mathematical Literacy OR any N certification (N2/N3/N4). Good hand-eye coordination and mechanical aptitude.",
    career_opportunities: "Engine Fitter, Engine Assembler, Engine Technician, Automotive Mechanic",
    course_pdf_url: "/pdfs/course-outlines/Automotive Engine Fitter.pdf",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    image_url: "",
    is_math_required: true,
    is_featured: true,
    saqa_id: "SAQA12345",
    is_visible: true
  },
  {
    id: 2,
    title: "Occupational Certificate: Automotive Clutch and Brake Repairer",
    short_title: " Automotive Clutch and Brake Repairer",
    description: "Comprehensive training program specializing in automotive clutch and brake systems. Covers diagnosis, repair, and maintenance of braking systems, clutch assemblies, and related components.",
    short_description: "Specialize in automotive clutch and brake system repair",
    duration: "12 months",
    credits: 166,
    deposit_amount: 6612.50,
    monthly_payment: 4959.38,
    total_payment: 47610,
    assessment_fee: 661.25,
    fee: 47610,
    registration_fee: 661.25,
    level: "beginner",
    curriculum: "Module 1: Brake System Fundamentals\n- Hydraulic brake systems\n- Disc and drum brakes\n- ABS and electronic systems\n\nModule 2: Clutch Systems\n- Manual transmission clutches\n- Hydraulic clutch systems\n- Automatic transmission components\n\nModule 3: Diagnosis and Repair\n- Brake system diagnosis\n- Clutch system troubleshooting\n- Component replacement\n\nModule 4: Safety and Testing\n- Brake testing procedures\n- Safety standards\n- Quality control",
    prerequisites: "Basic mechanical knowledge. Attention to detail for safety-critical systems.",
    requirements: "Grade 9 or Year 4 (ABET Level 4). No mathematics requirement. Valid driver's license recommended.",
    career_opportunities: "Brake Technician, Clutch Specialist, Automotive Repairer, Service Technician",
    course_pdf_url: "/pdfs/course-outlines/Automotive Clutch and Brake Repairer.pdf",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    image_url: "",
    is_math_required: false,
    is_featured: true,
    saqa_id: "SAQA12346",
    is_visible: true
  },
  {
    id: 3,
    title: "Occupational Certificate: Automotive Suspension Fitter",
    short_title: "Suspension Specialist",
    description: "Specialized training program focusing on automotive suspension systems, steering components, and wheel alignment. Students learn to diagnose, repair, and maintain suspension systems for various vehicle types.",
    short_description: "Master automotive suspension and steering system repair",
    duration: "9 months",
    credits: 123,
    deposit_amount: 6612.50,
    monthly_payment: 4131.38,
    total_payment: 40986,
    assessment_fee: 661.25,
    fee: 40986,
    registration_fee: 661.25,
    level: "intermediate",
    curriculum: "Module 1: Suspension Fundamentals\n- Suspension types and designs\n- Shock absorbers and struts\n- Springs and stabilizers\n\nModule 2: Steering Systems\n- Manual and power steering\n- Steering linkage\n- Steering geometry\n\nModule 3: Wheel Alignment\n- Alignment principles\n- Alignment equipment\n- Adjustment procedures\n\nModule 4: Diagnosis and Repair\n- Suspension troubleshooting\n- Component replacement\n- System testing",
    prerequisites: "Basic automotive knowledge. Understanding of vehicle dynamics.",
    requirements: "Grade 12 certificate. Previous mechanical experience beneficial.",
    career_opportunities: "Suspension Technician, Wheel Alignment Specialist, Automotive Repairer, Chassis Specialist",
    course_pdf_url: "/pdfs/course-outlines/Automotive Suspension Repairer.pdf",
    image: `/images/16.jpeg`,
    image_url: "",
    is_math_required: true,
    is_featured: true,
    saqa_id: "SAQA12347",
    is_visible: true
  },
  {
    id: 4,
    title: "Occupational Certificate: Automotive Workshop Assistant",
    short_title: "Workshop Assistant",
    description: "Foundational training program for automotive workshop operations. Covers workshop safety, basic maintenance, tool usage, and assistance procedures for automotive repair and maintenance.",
    short_description: "Start your career as an automotive workshop assistant",
    duration: "14 months",
    credits: 182,
    deposit_amount: 6612.50,
    monthly_payment: 5290.00,
    total_payment: 60835.00,
    assessment_fee: 661.25,
    fee: 60835.00,
    registration_fee: 661.25,
    level: "beginner",
    curriculum: "Module 1: Workshop Basics\n- Workshop safety procedures\n- Tool identification and usage\n- Workshop organization\n\nModule 2: Vehicle Maintenance\n- Basic maintenance procedures\n- Fluid checks and changes\n- Tire service\n\nModule 3: Assistance Skills\n- Technician assistance\n- Parts handling\n- Customer service\n\nModule 4: Workshop Operations\n- Inventory management\n- Workshop cleaning\n- Safety compliance",
    prerequisites: "No prior experience required. Interest in automotive work.",
    requirements: "Grade 12 OR Grade 10 with relevant experience. Willingness to learn and work in a team.",
    career_opportunities: "Workshop Assistant, Maintenance Assistant, Service Helper, Automotive Apprentice",
    course_pdf_url: "/pdfs/course-outlines/Automotive Workshop Assistant.pdf",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    image_url: "",
    is_math_required: false,
    is_featured: true,
    saqa_id: "SAQA12348",
    is_visible: true
  }
];

export const BANKING_DETAILS = {
  accountHolder: "Tucoprox (PTY) Ltd t/a Bathudi Automotive Technical Training Centre",
  bank: "First National Bank",
  accountNumber: "63097751622",
  branchCode: "250655",
  reference: "Student ID + Surname",
};

export const FEE_NOTES = {
  includes: [
    'COIDA insurance for the training period',
    'Registration and Assessment fee of R661.25 for all courses',
    'Training materials provided by the institution'
  ],
  excludes: [
    'Books and stationery',
    'Personal Protective Equipment (PPE)',
    'Tools and equipment',
    'Meals and refreshments',
    'Transportation costs',
    'Any other incidental charges'
  ],
  discounts: [
    '10% discount on total fees for upfront payment'
  ],
  payment_terms: [
    'Deposit must be paid before commencement of training',
    'Monthly payments due on 1st of each month',
    'R500 late payment fee after 7th of each month',
    'No cash payments accepted'
  ]
};

export const VALUES: Value[] = [
  {
    title: 'Moral Integrity',
    description: 'Building Future Mechanical Professionals Who Value Excellence, Integrity, Innovation, and Hands-On Expertise.',
    icon: '\uD83D\uDEE1\uFE0F'
  },
  {
    title: 'Youth Empowerment',
    description: 'Empowering the next generation of skilled automotive professionals.',
    icon: '\uD83D\uDCAA'
  },
  {
    title: 'Second Chances',
    description: 'Providing a pathway for South African youth to rewrite their future through hard work.',
    icon: '\uD83D\uDD04'
  },
  {
    title: 'Discipline',
    description: 'Fostering a culture of professionalism, punctuality, and respect.',
    icon: '\u2696\uFE0F'
  },
  {
    title: 'Sustainable Futures',
    description: 'Skills designed to last a lifetime in an evolving global automotive market.',
    icon: '\uD83C\uDF31'
  },
  {
    title: 'Community Impact',
    description: 'Strengthening our local economy by reducing unemployment and fostering talent.',
    icon: '\uD83E\uDD1D'
  }
];

export const TEAM: TeamMember[] = [
  { name: 'Ignatia Sekonyela', role: 'CEO/Founder', image: '5.jpg' },
  { name: 'Michael More', role: 'Senior Technical Trainer', image: '6.jpg' },
  { name: 'Kearabetswe Sekonyela', role: 'Communications Manager', image: '7.jpg' },
  { name: 'Bongeka Ntiemeza', role: 'Assistant Trainer', image: '8.jpg' },
];

export const NEWSLETTER: NewsletterPost[] = [
  {
    id: 1,
    title: 'New Workshop Equipment Arrival',
    date: 'Oct 12, 2023',
    preview_text: 'We are excited to announce the arrival of three state-of-the-art diagnostic scanners...',
    content: 'Full article content about new equipment...',
    date_published: '2023-10-12',
    is_published: true
  },
  {
    id: 2,
    title: 'Graduation Ceremony 2023',
    date: 'Sep 25, 2023',
    preview_text: 'Congratulations to our 45 students who successfully completed their automotive certificates...',
    content: 'Full article content about graduation...',
    date_published: '2023-09-25',
    is_published: true
  }
];

export const GALLERY_IMAGES = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg'];

export const SLOGANS = [
  { text: "BUILD YOUR ", highlight: "TOMORROW" },
  { text: "YAKHA ", highlight: "IKUSASA LAKHO" },
  { text: "AGA ", highlight: "BOKAMOSO BJA GAGO" }
];

export const ADMISSION_REQUIREMENTS = [
  {
    type: 'id_copy',
    title: 'Certified ID Copy',
    description: 'Certified copy of ID document or passport',
    icon: '\uD83D\uDCC4',
    is_required: true
  },
  {
    type: 'matric',
    title: 'Matric/School Certificate',
    description: 'Latest school results or matric certificate',
    icon: '\uD83C\uDF93',
    is_required: true
  },
  {
    type: 'fee',
    title: 'Registration & Assessment Fee',
    description: 'R661.25 non-refundable fee for both',
    icon: '💰',
    is_required: true
  },
  {
    type: 'maths',
    title: 'Mathematics',
    description: 'Required for some advanced courses',
    icon: '\uD83D\uDD22',
    is_required: false
  }
];

export const COURSE_FEATURES = [
  'SAQA Accredited Qualifications',
  'NQF Level 2-4 Certificates',
  'Hands-on Practical Training',
  'Industry Expert Instructors',
  'Job Placement Assistance',
  'Modern Workshop Facilities',
  'COIDA Insurance Coverage',
  'Flexible Payment Plans'
];

export const CONTACT_INFO = {
  phone: '+27 12 345 6789',
  email: 'admissions@bathudi.edu',
  address: '123 Automotive Street, Pretoria, South Africa',
  hours: 'Monday - Friday: 8:00 AM - 5:00 PM\nSaturday: 9:00 AM - 1:00 PM'
};

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const API_ENDPOINTS = {
  courses: `${API_BASE}/courses/`,
  applications: `${API_BASE}/applications/`,
  pdf: (courseId: string) => `${API_BASE}/course/${courseId}/pdf/download/`,
  generatePdf: (courseId: string) => `${API_BASE}/course/${courseId}/pdf/generate/`,
};

export const COURSE_DURATIONS = [
  '3 months', '4 months', '5 months', '6 months', 
  '8 months', '9 months', '12 months', '18 months'
];

export const COURSE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

export const APPLICATION_STATUS = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'contacted', label: 'Contacted', color: 'blue' }
];

export const PAYMENT_METHODS = [
  'Bank Transfer',
  'Cash Deposit',
  'Electronic Funds Transfer (EFT)',
  'Credit Card',
  'Debit Card'
];

export const GALLERY_CATEGORIES = [
  'classroom',
  'event', 
  'graduation',
  'facility',
  'student_work',
  'workshop',
  'training'
];

export const TESTIMONIAL_RATINGS = [1, 2, 3, 4, 5];

export const SOCIAL_MEDIA = {
  facebook: 'https://facebook.com/bathuditraining',
  twitter: 'https://twitter.com/bathuditraining',
  instagram: 'https://instagram.com/bathuditraining',
  linkedin: 'https://linkedin.com/company/bathuditraining',
  youtube: 'https://youtube.com/bathuditraining'
};

export const QUICK_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Courses', path: '/courses' },
  { name: 'About Us', path: '/about' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Team', path: '/team' },
  { name: 'Apply Now', path: '/apply' }
];

export const FOOTER_CONTACT = {
  phone: '+27 12 345 6789',
  email: 'info@bathuditraining.co.za',
  address: '123 Automotive Street, Industrial Area, Pretoria 0183',
  hours: 'Mon-Fri: 8:00 AM - 5:00 PM | Sat: 9:00 AM - 1:00 PM'
};
