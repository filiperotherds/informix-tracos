BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[de_para_ids] (
    [tracos_id] NVARCHAR(1000) NOT NULL,
    [logix_id] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [de_para_ids_pkey] PRIMARY KEY CLUSTERED ([tracos_id],[logix_id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [de_para_ids_tracos_id_idx] ON [dbo].[de_para_ids]([tracos_id]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
