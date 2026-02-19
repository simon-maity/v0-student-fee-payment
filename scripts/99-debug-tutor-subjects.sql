-- Debug script to check tutor_subjects mapping
-- Run this to verify tutors are properly assigned to subjects

SELECT 
  t.id as tutor_id,
  t.name as tutor_name,
  t.department,
  s.id as subject_id,
  s.name as subject_name,
  s.code,
  c.name as course_name
FROM tutors t
LEFT JOIN tutor_subjects ts ON t.id = ts.tutor_id
LEFT JOIN subjects s ON ts.subject_id = s.id
LEFT JOIN courses c ON s.course_id = c.id
ORDER BY t.name, s.name;
