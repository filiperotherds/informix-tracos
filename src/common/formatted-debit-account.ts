import z from "zod";

const debitAccountProps = z.object({
    cod_centro_custo: z.number(),
    cod_tip_despesa: z.number(),
})

type DebitAccountProps = z.infer<typeof debitAccountProps>

export function formattedDebitAccount(props: DebitAccountProps): string {
    const { cod_centro_custo, cod_tip_despesa } = props
    
    return `${cod_centro_custo}0${cod_tip_despesa}`
}