export interface PeriodeDto {
  id: string;
  label: string;
  dateDebut: Date;
  dateFin: Date;
  anneeScolaireId: string;
}

export interface DomaineDto {
  id: string;
  label: string;
  disciplineId: string;
  matiereId: string | null;
}

export interface NiveauRefDto {
  value: string;
  label: string;
  code: string;
}

export interface CycleNiveauxDto {
  cycleId: string;
  cycleLabel: string;
  niveaux: NiveauRefDto[];
}

export interface ObjectifRefDto {
  value: string;
  label: string;
  sousDomainId: string;
}

export interface SousDomainRefDto {
  value: string;
  label: string;
  domaineId: string;
  objectifs: ObjectifRefDto[];
}

export interface DomaineRefDto {
  value: string;
  label: string;
  disciplineId: string;
  sousDomaines: SousDomainRefDto[];
}

export interface DisciplineRefDto {
  value: string;
  label: string;
  domaines: DomaineRefDto[];
}

export interface SequenceReferenceTreeDto {
  niveauxByCycle: CycleNiveauxDto[];
  disciplines: DisciplineRefDto[];
}
