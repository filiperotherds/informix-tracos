/*
  Warnings:

  - The primary key for the `de_para_reserva` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[de_para_reserva] DROP CONSTRAINT [de_para_reserva_pkey];
ALTER TABLE [dbo].[de_para_reserva] ADD [id] INT IDENTITY(1,1);

-- CreateIndex
CREATE NONCLUSTERED INDEX [de_para_reserva_logix_id_idx] ON [dbo].[de_para_reserva]([logix_id]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
