/*
  # Seed Initial Data

  1. Sample Data
    - Demo jobs across different departments
    - Sample candidates with various skills
    - Demo applications in different stages
    - Admin and recruiter users

  2. Notes
    - This data is for demonstration purposes
    - Passwords are set to 'password123' for demo accounts
    - Real production data should be added through the application
*/

-- Insert sample jobs
INSERT INTO jobs (id, title, department, location, type, status, description, requirements, salary_min, salary_max, posted_date) VALUES
(
  'job-1',
  'Senior Frontend Developer',
  'Engineering',
  'San Francisco, CA',
  'full-time',
  'active',
  'We are looking for a skilled Senior Frontend Developer to join our dynamic team. You will be responsible for developing user interfaces for web applications using modern technologies.',
  ARRAY['React', 'TypeScript', 'CSS3', 'Node.js', '5+ years experience'],
  120000,
  180000,
  '2024-01-15'
),
(
  'job-2',
  'Product Manager',
  'Product',
  'Remote',
  'remote',
  'active',
  'Join our product team to drive the vision and strategy for our core platform. You will work closely with engineering and design teams to deliver exceptional user experiences.',
  ARRAY['Product Management', 'Agile', 'Data Analysis', 'User Research', '3+ years experience'],
  110000,
  160000,
  '2024-01-10'
),
(
  'job-3',
  'UX Designer',
  'Design',
  'New York, NY',
  'full-time',
  'active',
  'We are seeking a creative UX Designer to help us create intuitive and engaging user experiences. You will collaborate with cross-functional teams to design solutions that delight our users.',
  ARRAY['Figma', 'User Research', 'Prototyping', 'UI/UX Design', '2+ years experience'],
  85000,
  130000,
  '2024-01-08'
),
(
  'job-4',
  'Backend Engineer',
  'Engineering',
  'Austin, TX',
  'full-time',
  'paused',
  'Looking for a Backend Engineer to build and maintain our server-side applications. You will work with databases, APIs, and cloud infrastructure.',
  ARRAY['Python', 'Django', 'PostgreSQL', 'AWS', '3+ years experience'],
  100000,
  150000,
  '2024-01-05'
);

-- Insert sample candidates
INSERT INTO candidates (id, name, email, phone, location, experience, skills, resume_url, linkedin_url, github_url, join_date, last_active) VALUES
(
  'candidate-1',
  'Sarah Johnson',
  'sarah.johnson@email.com',
  '+1 (555) 123-4567',
  'San Francisco, CA',
  6,
  ARRAY['React', 'TypeScript', 'JavaScript', 'CSS3', 'Node.js', 'GraphQL'],
  'https://example.com/resume-sarah.pdf',
  'https://linkedin.com/in/sarahjohnson',
  'https://github.com/sarahjohnson',
  '2024-01-20',
  '2024-01-22'
),
(
  'candidate-2',
  'Michael Chen',
  'michael.chen@email.com',
  '+1 (555) 234-5678',
  'Seattle, WA',
  5,
  ARRAY['Product Management', 'Agile', 'Data Analysis', 'User Research', 'SQL'],
  'https://example.com/resume-michael.pdf',
  'https://linkedin.com/in/michaelchen',
  NULL,
  '2024-01-18',
  '2024-01-21'
),
(
  'candidate-3',
  'Emily Rodriguez',
  'emily.rodriguez@email.com',
  '+1 (555) 345-6789',
  'New York, NY',
  3,
  ARRAY['Figma', 'Sketch', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
  'https://example.com/resume-emily.pdf',
  'https://linkedin.com/in/emilyrodriguez',
  NULL,
  '2024-01-22',
  '2024-01-22'
),
(
  'candidate-4',
  'David Kim',
  'david.kim@email.com',
  '+1 (555) 456-7890',
  'Los Angeles, CA',
  8,
  ARRAY['React', 'Vue.js', 'JavaScript', 'Python', 'AWS', 'Docker'],
  'https://example.com/resume-david.pdf',
  'https://linkedin.com/in/davidkim',
  'https://github.com/davidkim',
  '2024-01-15',
  '2024-01-23'
),
(
  'candidate-5',
  'Lisa Park',
  'lisa.park@email.com',
  '+1 (555) 567-8901',
  'Chicago, IL',
  4,
  ARRAY['Product Strategy', 'Market Research', 'Analytics', 'Roadmapping', 'Scrum'],
  'https://example.com/resume-lisa.pdf',
  'https://linkedin.com/in/lisapark',
  NULL,
  '2024-01-12',
  '2024-01-24'
);

-- Insert sample applications
INSERT INTO applications (id, job_id, candidate_id, status, stage, applied_date, last_updated, resume_url, cover_letter, notes) VALUES
(
  'app-1',
  'job-1',
  'candidate-1',
  'interview',
  3,
  '2024-01-20',
  '2024-01-22',
  'https://example.com/resume-sarah.pdf',
  'I am excited to apply for the Senior Frontend Developer position...',
  ARRAY['Technical interview scheduled for Jan 25', 'Strong React background']
),
(
  'app-2',
  'job-2',
  'candidate-2',
  'screening',
  2,
  '2024-01-18',
  '2024-01-21',
  'https://example.com/resume-michael.pdf',
  'With 5 years of product management experience...',
  ARRAY['Phone screening completed', 'Good communication skills']
),
(
  'app-3',
  'job-3',
  'candidate-3',
  'applied',
  1,
  '2024-01-22',
  '2024-01-22',
  'https://example.com/resume-emily.pdf',
  'I am passionate about creating user-centered designs...',
  ARRAY[]::TEXT[]
),
(
  'app-4',
  'job-1',
  'candidate-4',
  'offer',
  4,
  '2024-01-15',
  '2024-01-23',
  'https://example.com/resume-david.pdf',
  'I have been following your company for years...',
  ARRAY['Excellent technical skills', 'Offer extended', 'Waiting for response']
),
(
  'app-5',
  'job-2',
  'candidate-5',
  'hired',
  5,
  '2024-01-12',
  '2024-01-24',
  'https://example.com/resume-lisa.pdf',
  'I am thrilled to apply for the Product Manager role...',
  ARRAY['Offer accepted', 'Start date: Feb 1']
);