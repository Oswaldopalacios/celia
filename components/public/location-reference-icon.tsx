"use client";

import {
  Car,
  ForkKnife,
  House,
  MapPin,
  Star,
  Sun,
  TreePalm,
  Waves,
  type Icon,
} from "@phosphor-icons/react";
import type { LocationReferenceIcon } from "@/lib/types";

export const LOCATION_REFERENCE_ICONS: Record<LocationReferenceIcon, Icon> = {
  palm: TreePalm,
  pin: MapPin,
  car: Car,
  waves: Waves,
  sun: Sun,
  fork: ForkKnife,
  house: House,
  star: Star,
};
