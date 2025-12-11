/*
  Warnings:

  - You are about to drop the `de_para_ids` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropTable
DROP TABLE [dbo].[de_para_ids];

-- CreateTable
CREATE TABLE [dbo].[de_para_reserva] (
    [tracos_id] NVARCHAR(1000) NOT NULL,
    [logix_id] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [de_para_reserva_pkey] PRIMARY KEY CLUSTERED ([tracos_id],[logix_id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [de_para_reserva_tracos_id_idx] ON [dbo].[de_para_reserva]([tracos_id]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
