ALTER TABLE APP_ACT_KMS_CARD ADD ISRATE smallint null default NULL;
UPDATE APP_ACT_KMS_CARD SET ISRATE = 1;
ALTER TABLE APP_ACT_KMS_FILE ALTER COLUMN FILENAME nvarchar(256);