DROP DATABASE IF EXISTS AssessMyMail;
CREATE DATABASE IF NOT EXISTS AssessMyMail;
USE AssessMyMail;

DROP TABLE IF EXISTS tier;
CREATE TABLE IF NOT EXISTS tier
(
	tier_id				INT										PRIMARY KEY,
    tier_name			ENUM('guest', 'premium', 'ultimate') 	NOT NULL,
    emails_per_month	INT 									NOT NULL
);

DROP TABLE IF EXISTS customer;
CREATE TABLE IF NOT EXISTS customer
(
	customer_id			INT							AUTO_INCREMENT		PRIMARY KEY,
    tier_id				INT												NOT NULL,
    customer_name		VARCHAR(100)									NOT NULL,
    customer_email		VARCHAR(255)				UNIQUE				NOT NULL,
    customer_password   VARCHAR(255)									NOT NULL,
    customer_status		ENUM('active', 'inactive')						NOT NULL,
    created_at			TIMESTAMP					DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tier_id) REFERENCES tier(tier_id)
);

DROP TABLE IF EXISTS customer_quota;
CREATE TABLE IF NOT EXISTS customer_quota
(
	quota_id			INT					AUTO_INCREMENT		PRIMARY KEY,
	customer_id			INT										NOT NULL,
    emails_processed	INT					DEFAULT 0			NOT NULL,
    last_processed		TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

DROP TABLE IF EXISTS customer_feedback;
CREATE TABLE IF NOT EXISTS customer_feedback
(
	feedback_id			INT					AUTO_INCREMENT		PRIMARY KEY,
    customer_id			INT										NOT NULL,
    feedback_rating		INT										NOT NULL,
    feedback_comment	TEXT									NULL,
    submitted_at		TIMESTAMP 			DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);