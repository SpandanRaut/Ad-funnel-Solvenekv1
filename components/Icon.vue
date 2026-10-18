<script setup lang="ts">
import {
  Megaphone,
  Bot,
  Video,
  MessageCircle,
  CalendarDays,
  ChartNoAxesCombined,
  ChartNoAxesColumnIncreasing,
  Zap,
  Play,
  Lightbulb,
  Search,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Globe,
  Mail,
  Volume2,
  VolumeX,
  Maximize,
  MoreVertical,
  Pause,
  ShieldCheck,
} from "lucide-vue-next";
defineProps<{ name: string; size?: number }>();
const icons = {
  Megaphone,
  Bot,
  Video,
  MessageCircle,
  CalendarDays,
  ChartNoAxesCombined,
  ChartNoAxesColumnIncreasing,
  Zap,
  Play,
  Lightbulb,
  Search,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Globe,
  Mail,
  Volume2,
  VolumeX,
  Maximize,
  MoreVertical,
  Pause,
  ShieldCheck,
};
</script>
<template>
  <component
    :is="icons[name as keyof typeof icons] || MessageCircle"
    :size="size || 20"
    :stroke-width="1.6"
    aria-hidden="true"
  />
</template>
