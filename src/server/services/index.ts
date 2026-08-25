import { prisma } from '@/lib/prisma';
import { ClasseurService } from './classeur.service';
import { MatiereService } from './matiere.service';
import { SequenceService } from './sequence.service';
import { FicheService } from './fiche.service';
import { PhaseService } from './phase.service';
import { ReferenceService } from './reference.service';
import { FichierService } from './fichier.service';

// Factories pour les routers tRPC (injectent ctx.prisma)
export { classeurService } from './classeur.service';
export { matiereService } from './matiere.service';
export { sequenceService } from './sequence.service';
export { ficheService } from './fiche.service';
export { phaseService } from './phase.service';
export { referenceService } from './reference.service';
export { fichierService } from './fichier.service';

// Instances liées au singleton prisma — à utiliser dans les Server Components (pages)
export const classeurSvc = new ClasseurService(prisma);
export const matiereSvc = new MatiereService(prisma);
export const sequenceSvc = new SequenceService(prisma);
export const ficheSvc = new FicheService(prisma);
export const phaseSvc = new PhaseService(prisma);
export const referenceSvc = new ReferenceService(prisma);
export const fichierSvc = new FichierService(prisma);
