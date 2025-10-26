CREATE TABLE refresh_tokens (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    refresh_token VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE refresh_tokens
ADD CONSTRAINT fk_user_refresh
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;
