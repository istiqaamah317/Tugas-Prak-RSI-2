-- Login KHUSUS untuk Tugas 2 (beda dari praktikum_user di hands-on),
-- supaya kredensial tugas & praktikum tidak tercampur.
USE master;
GO

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'ama')
BEGIN
    CREATE LOGIN ama
        WITH PASSWORD = N'ama_Tugas2026!',
             DEFAULT_DATABASE = review_kantin;
END
GO

USE review_kantin;
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'ama')
BEGIN
    CREATE USER ama FOR LOGIN ama;
END
GO

ALTER ROLE db_datareader ADD MEMBER ama;
ALTER ROLE db_datawriter ADD MEMBER ama;
GO

SELECT name, type_desc, authentication_type_desc
FROM sys.database_principals
WHERE name = 'ama';
GO
