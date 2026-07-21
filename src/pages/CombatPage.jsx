import { useState, useEffect } from "react";

import CombatSidebar from "../components/Combats/CombatSidebar";
import MonsterHeader from "../components/Combats/MonsterHeader";
import MonsterTabs from "../components/Combats/MonsterTabs";
import MonsterPanel from "../components/Combats/MonsterPanel";
import { useDataHandler } from "../context/dataHandlerContext/DataHandlerContext";

export default function CombatPage() {
  const { combatId, combats } = useDataHandler();

  const [selectedTab, setSelectedTab] = useState("combat");

  const monsters = [
    {
      id: "blood_zombie",
      name: "Blood Zombie",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZPj2MX7yEFpT3bqJR0ImNDrt9z61_lSBRvst4pdi7PA&s=10",
      element: "Blood",
      type: "Boss",
      size: "Medium",

      hp: {
        current: 60,
        max: 60,
      },
      combat: {
        defense: 15,
        movement: 9,

        sanityDamage: {
          value: 15,
          damage: "2d10",
        },
      },
      attributes: {
        agility: 1,
        strength: 3,
        intellect: 0,
        presence: 0,
        vigor: 3,
      },

      skills: [
    { id: "skill-fortitude", name: "Fortitude", attribute: "vigor", bonus: 5, lastResult: null },
    { id: "skill-luta", name: "Luta", attribute: "strength", bonus: 6, lastResult: null },
    { id: "skill-iniciativa", name: "Iniciativa", attribute: "agility", bonus: 3, lastResult: null },
    { id: "skill-pontaria", name: "Pontaria", attribute: "agility", bonus: 0, lastResult: null },
    { id: "skill-vontade", name: "Vontade", attribute: "presence", bonus: 2, lastResult: null },
    ],

      attacks: [
        {
          id: "attack-claws",
          name: "Claws",
          type: "Corpo a Corpo",
          range: "3m",
          testBonus: 8,
          damage: "2d8+5",
          threatMargin: 20,
          critMultiplier: 2,
          lastTestResult: null,
          lastCritical: false,
          lastDamageResult: null,
          lastCritDamageResult: null,
        },
      ],
      abilities: [
        {
          id: "ability-fury",
          name: "Uncontrolled Fury",
          attributeName: "Fúria Descontrolada",
          attributeDescription: "When below 50% HP, gains +2 on attack rolls.",
        },
      ],
      resistances: [
        {
          id: "resistance-blood",
          name: "Sangue",
          description: "Reduz em 10 o dano recebido do elemento Sangue.",
        },
      ],
      vulnerabilities: [{ id: "vuln-death", value: "Death" }],

      immunities: [
        { id: "immunity-fear", value: "Fear" },
        { id: "immunity-bleeding", value: "Bleeding" },
        { id: "immunity-blindness", value: "Blindness" },
      ],

      fearEnigma: "",

      description: "A creature twisted by the Blood element, driven only by violence.",
    },
  ];

  const [selectedEntity, setSelectedEntity] = useState(monsters[0]);

  function updateEntity(updater) {
    setSelectedEntity((prev) => updater(prev));
  }

  function handleDescriptionChange(value) {
    updateEntity((prev) => ({ ...prev, description: value }));
  }

  function handleFearEnigmaChange(value) {
    updateEntity((prev) => ({ ...prev, fearEnigma: value }));
  }

  // ================= PERÍCIAS =================

  function handleSkillAdd() {
    updateEntity((prev) => ({
        ...prev,
        skills: [
            ...prev.skills,
            {
                id: crypto.randomUUID(),
                name: "Nova Perícia",
                attribute: "agility",
                bonus: 0,
                lastResult: null,
            },
        ],
    }));
  }

  function handleSkillRemove(skillId) {
    updateEntity((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.id !== skillId),
    }));
  }

  function handleSkillChange(skillId, field, value) {
    updateEntity((prev) => ({
      ...prev,
      skills: prev.skills.map((skill) =>
        skill.id === skillId ? { ...skill, [field]: value } : skill,
      ),
    }));
  }

  function handleSkillResult(skillId, result) {
    updateEntity((prev) => ({
      ...prev,
      skills: prev.skills.map((skill) =>
        skill.id === skillId ? { ...skill, lastResult: result } : skill,
      ),
    }));
  }

  // ================= ATAQUES =================

  function handleAttackAdd() {
    updateEntity((prev) => ({
      ...prev,
      attacks: [
        ...prev.attacks,
        {
          id: crypto.randomUUID(),
          name: "Novo Ataque",
          type: "Corpo a Corpo",
          range: "",
          testBonus: 0,
          damage: "1d6",
          threatMargin: 20,
          critMultiplier: 2,
          lastTestResult: null,
          lastCritical: false,
          lastDamageResult: null,
          lastCritDamageResult: null,
        },
      ],
    }));
  }

  function handleAttackRemove(attackId) {
    updateEntity((prev) => ({
      ...prev,
      attacks: prev.attacks.filter((attack) => attack.id !== attackId),
    }));
  }

  function handleAttackChange(attackId, field, value) {
    updateEntity((prev) => ({
      ...prev,
      attacks: prev.attacks.map((attack) =>
        attack.id === attackId ? { ...attack, [field]: value } : attack,
      ),
    }));
  }

  function handleAttackTestResult(attackId, result) {
    updateEntity((prev) => ({
      ...prev,
      attacks: prev.attacks.map((attack) =>
        attack.id === attackId
          ? {
              ...attack,
              lastTestResult: result.total,
              lastCritical: result.isCritical,
            }
          : attack,
      ),
    }));
  }

  function handleAttackDamageResult(attackId, result) {
    updateEntity((prev) => ({
      ...prev,
      attacks: prev.attacks.map((attack) =>
        attack.id === attackId
          ? { ...attack, lastDamageResult: result.total }
          : attack,
      ),
    }));
  }

  function handleAttackCritDamageResult(attackId, result) {
    updateEntity((prev) => ({
      ...prev,
      attacks: prev.attacks.map((attack) =>
        attack.id === attackId
          ? { ...attack, lastCritDamageResult: result.total }
          : attack,
      ),
    }));
  }

  // ================= HABILIDADES =================

  function handleAbilityAdd() {
    updateEntity((prev) => ({
      ...prev,
      abilities: [
        ...prev.abilities,
        {
          id: crypto.randomUUID(),
          name: "Nova Habilidade",
          attributeName: "",
          attributeDescription: "",
        },
      ],
    }));
  }

  function handleAbilityRemove(abilityId) {
    updateEntity((prev) => ({
      ...prev,
      abilities: prev.abilities.filter((ability) => ability.id !== abilityId),
    }));
  }

  function handleAbilityChange(abilityId, field, value) {
    updateEntity((prev) => ({
      ...prev,
      abilities: prev.abilities.map((ability) =>
        ability.id === abilityId ? { ...ability, [field]: value } : ability,
      ),
    }));
  }

  // ================= RESISTÊNCIAS =================

  function handleResistanceAdd() {
    updateEntity((prev) => ({
      ...prev,
      resistances: [
        ...prev.resistances,
        { id: crypto.randomUUID(), name: "Nova Resistência", description: "" },
      ],
    }));
  }

  function handleResistanceRemove(resistanceId) {
    updateEntity((prev) => ({
      ...prev,
      resistances: prev.resistances.filter(
        (resistance) => resistance.id !== resistanceId,
      ),
    }));
  }

  function handleResistanceChange(resistanceId, field, value) {
    updateEntity((prev) => ({
      ...prev,
      resistances: prev.resistances.map((resistance) =>
        resistance.id === resistanceId
          ? { ...resistance, [field]: value }
          : resistance,
      ),
    }));
  }

  // ================= VULNERABILIDADES =================

  function handleVulnerabilityAdd() {
    updateEntity((prev) => ({
      ...prev,
      vulnerabilities: [
        ...prev.vulnerabilities,
        { id: crypto.randomUUID(), value: "" },
      ],
    }));
  }

  function handleVulnerabilityRemove(vulnerabilityId) {
    updateEntity((prev) => ({
      ...prev,
      vulnerabilities: prev.vulnerabilities.filter(
        (item) => item.id !== vulnerabilityId,
      ),
    }));
  }

  function handleVulnerabilityChange(vulnerabilityId, value) {
    updateEntity((prev) => ({
      ...prev,
      vulnerabilities: prev.vulnerabilities.map((item) =>
        item.id === vulnerabilityId ? { ...item, value } : item,
      ),
    }));
  }

  // ================= IMUNIDADES =================

  function handleImmunityAdd() {
    updateEntity((prev) => ({
      ...prev,
      immunities: [...prev.immunities, { id: crypto.randomUUID(), value: "" }],
    }));
  }

  function handleImmunityRemove(immunityId) {
    updateEntity((prev) => ({
      ...prev,
      immunities: prev.immunities.filter((item) => item.id !== immunityId),
    }));
  }

  function handleImmunityChange(immunityId, value) {
    updateEntity((prev) => ({
      ...prev,
      immunities: prev.immunities.map((item) =>
        item.id === immunityId ? { ...item, value } : item,
      ),
    }));
  }

  return (
    <div className="flex h-full overflow-hidden bg-zinc-950">
      <CombatSidebar
        entities={monsters}
        selectedEntity={selectedEntity}
        setSelectedEntity={setSelectedEntity}
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        <MonsterHeader monster={selectedEntity} />

        <MonsterTabs
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />

        <MonsterPanel
          monster={selectedEntity}
          selectedTab={selectedTab}
          onDescriptionChange={handleDescriptionChange}
          onFearEnigmaChange={handleFearEnigmaChange}
          onSkillAdd={handleSkillAdd}
          onSkillRemove={handleSkillRemove}
          onSkillChange={handleSkillChange}
          onSkillResult={handleSkillResult}
          onAttackAdd={handleAttackAdd}
          onAttackRemove={handleAttackRemove}
          onAttackChange={handleAttackChange}
          onAttackTestResult={handleAttackTestResult}
          onAttackDamageResult={handleAttackDamageResult}
          onAttackCritDamageResult={handleAttackCritDamageResult}
          onAbilityAdd={handleAbilityAdd}
          onAbilityRemove={handleAbilityRemove}
          onAbilityChange={handleAbilityChange}
          onResistanceAdd={handleResistanceAdd}
          onResistanceRemove={handleResistanceRemove}
          onResistanceChange={handleResistanceChange}
          onVulnerabilityAdd={handleVulnerabilityAdd}
          onVulnerabilityRemove={handleVulnerabilityRemove}
          onVulnerabilityChange={handleVulnerabilityChange}
          onImmunityAdd={handleImmunityAdd}
          onImmunityRemove={handleImmunityRemove}
          onImmunityChange={handleImmunityChange}
        />
      </main>
    </div>
  );
}
