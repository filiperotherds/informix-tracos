/*
  Warnings:

  - A unique constraint covering the columns `[tracos_id]` on the table `de_para_reserva` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[logix_id]` on the table `de_para_reserva` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- CreateIndex
ALTER TABLE [dbo].[de_para_reserva] ADD CONSTRAINT [de_para_reserva_tracos_id_key] UNIQUE NONCLUSTERED ([tracos_id]);

-- CreateIndex
ALTER TABLE [dbo].[de_para_reserva] ADD CONSTRAINT [de_para_reserva_logix_id_key] UNIQUE NONCLUSTERED ([logix_id]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
