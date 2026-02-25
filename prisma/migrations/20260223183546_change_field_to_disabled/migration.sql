/*
  Warnings:

  - You are about to drop the column `status` on the `xref_item` table. All the data in the column will be lost.
  - Added the required column `disabled` to the `xref_item` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[xref_item] DROP COLUMN [status];
ALTER TABLE [dbo].[xref_item] ADD [disabled] BIT NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
