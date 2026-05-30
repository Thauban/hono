import { z } from 'zod';

const SoldatComplete = z.strictObject({
    // bei GraphQL ist der Typ ID i.a. ein String
    id: z.union([z.number().int().gt(0), z.string().regex(/^[1-9]\d*$/u)]),
    version: z.int().gte(0),
    vorname: z.string().min(2).max(100),
    nachname: z.string().min(2).max(100),
    geburtsdatum: z.coerce.date(),
    geschlecht: z.enum(['MAENNLICH', 'WEIBLICH', 'DIVERSE']),
    rang: z.enum(['REKRUT','SOLDAT','ELITE-SOLDAT','CAPTAIN','KOMMANDANT']),

    ausruestung: z.strictObject({
        waffe: z.enum([ 'ODM_GEAR','Schrotflinte','Klinge']),
        seriennummer: z.string().regex(/^AOT-\d{5}[A-Z]{3}$/),
    }),
    verletzungen: z
        .array(
            z.strictObject({
                verletzungsbeschreibung: z.string().max(32),
                behandelt: z.boolean(),
                schweregrad: z.enum(['LEICHT', 'MITTEL', 'SCHWER']),
                verletzungsdatum: z.coerce.date(),
            }),
        )
        .optional(),
});
export const SoldatNeuSchema = SoldatComplete.omit({
    id: true,
    version: true,
}).readonly();

export const SoldatUpdateSchema = SoldatComplete.omit({
    id: true,
    version: true,
    ausruestung: true,
    verletzungen: true,
}).readonly();

export const SoldatUpdateGraphQLSchema = SoldatComplete.omit({
    ausruestung: true,
    verletzungen: true,
}).readonly();

export type SoldatNeuType = z.infer<typeof SoldatNeuSchema>;
export type SoldatUpdateType = z.infer<typeof SoldatUpdateSchema>;
