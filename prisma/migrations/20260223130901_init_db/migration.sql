/*
  Warnings:

  - You are about to drop the `de_para_reserva` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropTable
DROP TABLE [dbo].[de_para_reserva];

-- CreateTable
CREATE TABLE [dbo].[xref_reservation] (
    [id] INT NOT NULL IDENTITY(1,1),
    [tracos_id] NVARCHAR(1000) NOT NULL,
    [logix_id] NVARCHAR(1000) NOT NULL,
    [status] VARCHAR(20),
    CONSTRAINT [xref_reservation_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [xref_reservation_tracos_id_key] UNIQUE NONCLUSTERED ([tracos_id]),
    CONSTRAINT [xref_reservation_logix_id_key] UNIQUE NONCLUSTERED ([logix_id])
);

-- CreateTable
CREATE TABLE [dbo].[xref_item] (
    [id] INT NOT NULL IDENTITY(1,1),
    [tracos_id] NVARCHAR(1000) NOT NULL,
    [logix_id] NVARCHAR(1000) NOT NULL,
    [status] VARCHAR(20),
    CONSTRAINT [xref_item_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [xref_item_tracos_id_key] UNIQUE NONCLUSTERED ([tracos_id]),
    CONSTRAINT [xref_item_logix_id_key] UNIQUE NONCLUSTERED ([logix_id])
);

-- CreateTable
CREATE TABLE [dbo].[tracos_token] (
    [id] INT NOT NULL IDENTITY(1,1),
    [token] NVARCHAR(1000) NOT NULL,
    [company_id] VARCHAR(4) NOT NULL,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [tracos_token_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [tracos_token_token_key] UNIQUE NONCLUSTERED ([token]),
    CONSTRAINT [tracos_token_company_id_key] UNIQUE NONCLUSTERED ([company_id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [xref_reservation_tracos_id_idx] ON [dbo].[xref_reservation]([tracos_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [xref_reservation_logix_id_idx] ON [dbo].[xref_reservation]([logix_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [xref_item_tracos_id_idx] ON [dbo].[xref_item]([tracos_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [xref_item_logix_id_idx] ON [dbo].[xref_item]([logix_id]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
