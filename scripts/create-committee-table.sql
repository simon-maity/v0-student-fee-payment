-- Create committee_users table
CREATE TABLE IF NOT EXISTS committee_users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES admin_users(id)
);

-- Create index for email and username
CREATE INDEX idx_committee_email ON committee_users(email);
CREATE INDEX idx_committee_username ON committee_users(username);

-- Create index for status
CREATE INDEX idx_committee_status ON committee_users(status);

-- Add comment to table
COMMENT ON TABLE committee_users IS 'Committee users with access to stationery requests only';
