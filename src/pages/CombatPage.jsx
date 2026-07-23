import { useState, useEffect } from "react";

import CombatSidebar from "../components/Combats/CombatSidebar";
import MonsterHeader from "../components/Combats/MonsterHeader";
import MonsterTabs from "../components/Combats/MonsterTabs";
import MonsterPanel from "../components/Combats/MonsterPanel";
import { useDataHandler } from "../context/dataHandlerContext/DataHandlerContext";

export default function CombatPage() {
  const { combatId, combats } = useDataHandler();
  const { monstersList, setMonstersList } = useDataHandler();

  const [selectedTab, setSelectedTab] = useState("combat");

	const [selectedEntity, setSelectedEntity] = useState(null);

	useEffect(() => {
		if (!combatId) return;

		const matchedCombat = (combats || []).find(
			(item) => item.id === combatId
		);

		if (!matchedCombat) return;

		const matchedMonster = (monstersList || []).find(
			(monster) => monster.id === matchedCombat.monsterId
		);

		if (matchedMonster && matchedMonster.id !== selectedEntity?.id) {
			setSelectedEntity(matchedMonster);
		}
	}, [combatId, combats, monstersList, selectedEntity]);

  function updateEntity(updater) {
		if (!selectedEntity) return;

		const updated = updater(selectedEntity);

		setSelectedEntity(updated);

		setMonstersList((list) =>
			list.map((monster) =>
				monster.id === updated.id
					? updated
					: monster
			)
		);
	}

	// ================= HEADER/HP/DEFESA/DESLOCAMENTO/ATRIBUTOS =================
	function handleHpCurrentChange(value) {
		updateEntity((prev) => ({
			...prev,
			hp: {
				...prev.hp,
				current: value,
			},
		}));
	}
	function handleHpMaxChange(value) {
		updateEntity((prev) => ({
			...prev,
			hp: {
				...prev.hp,
				max: value,
			},
		}));
	}

	function handleDamage(amount) {
		updateEntity((prev) => ({
			...prev,
			hp: {
				...prev.hp,
				current: Math.max(0, prev.hp.current - amount),
			},
		}));
	}

	function handleHeal(amount) {
		updateEntity((prev) => ({
			...prev,
			hp: {
				...prev.hp,
				current: Math.min(prev.hp.max, prev.hp.current + amount),
			},
		}));
	}

	function handleDefenseChange(value) {
		updateEntity((prev) => ({
			...prev,
			combat: {
				...prev.combat,
				defense: value,
			},
		}));
	}

	function handleMovementChange(value) {
		updateEntity((prev) => ({
			...prev,
			combat: {
				...prev.combat,
				movement: value,
			},
		}));
	}

	function handleSanityValueChange(value) {
		updateEntity((prev) => ({
			...prev,
			combat: {
				...prev.combat,
				sanityDamage: {
					...prev.combat.sanityDamage,
					value: value,
				},
			},
		}));
	}

	function handleSanityDamageChange(value) {
		updateEntity((prev) => ({
			...prev,
			combat: {
				...prev.combat,
				sanityDamage: {
					...prev.combat.sanityDamage,
					damage: value,
				},
			},
		}));
	}

	function handleAttributeChange(attribute, value) {
		updateEntity((prev) => ({
			...prev,
			attributes: {
				...prev.attributes,
				[attribute]: value,
			},
		}));
	}
	// ================= DESCRIÇÃO E ENIGMA DO MEDO =================

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

	if (!selectedEntity) {
		//console.log(selectedEntity)
		return (
			<div className="flex h-full items-center justify-center bg-zinc-950 text-zinc-500">
				Selecione um combate para começar.
			</div>
		);
	}

  return (
    <div className="flex h-full overflow-hidden bg-zinc-950">
      <CombatSidebar
				entities={monstersList}
				selectedEntity={selectedEntity}
				setSelectedEntity={setSelectedEntity}
			/>

      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        <MonsterHeader 
					monster={selectedEntity}
					onDamage={handleDamage}
					onHeal={handleHeal} 
					onAttributeChange={handleAttributeChange}
					onDefenseChange={handleDefenseChange}
					onMovementChange={handleMovementChange}
					onHpCurrentChange={handleHpCurrentChange}
					onHpMaxChange={handleHpMaxChange}
					onSanityDamageChange={handleSanityDamageChange}
					onSanityValueChange={handleSanityValueChange}
				/>

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
