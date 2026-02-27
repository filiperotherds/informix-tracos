BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[direct_debit_temp] (
    [id] INT NOT NULL IDENTITY(1,1),
    [num_nf] NVARCHAR(1000) NOT NULL,
    [os_num] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [direct_debit_temp_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [direct_debit_temp_num_nf_os_num_key] UNIQUE NONCLUSTERED ([num_nf],[os_num])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
