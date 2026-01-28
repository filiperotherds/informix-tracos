/*
  Warnings:

  - You are about to alter the column `status` on the `de_para_reserva` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `VarChar(20)`.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[de_para_reserva] ALTER COLUMN [status] VARCHAR(20) NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
