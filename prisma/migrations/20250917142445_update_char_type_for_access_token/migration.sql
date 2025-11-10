/*
  Warnings:

  - You are about to alter the column `access_token` on the `user` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `Char`.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[user] ALTER COLUMN [access_token] CHAR NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
