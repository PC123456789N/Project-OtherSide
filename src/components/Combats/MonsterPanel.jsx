import CombatSection from "./CombatSection";
import SkillsSection from "./SkillsSection";
import DescriptionSection from "./DescriptionSection";

export default function MonsterPanel({

    monster,
    selectedTab,

    onDescriptionChange,
    onFearEnigmaChange,

    onSkillAdd,
    onSkillRemove,
    onSkillChange,
    onSkillResult,

    onAttackAdd,
    onAttackRemove,
    onAttackChange,
    onAttackTestResult,
    onAttackDamageResult,
    onAttackCritDamageResult,

    onAbilityAdd,
    onAbilityRemove,
    onAbilityChange,

    onResistanceAdd,
    onResistanceRemove,
    onResistanceChange,

    onVulnerabilityAdd,
    onVulnerabilityRemove,
    onVulnerabilityChange,

    onImmunityAdd,
    onImmunityRemove,
    onImmunityChange,

}) {

    function renderContent() {

        switch (selectedTab) {

            case "combat":

                return (
                    <CombatSection
                        monster={monster}
                        onAttackAdd={onAttackAdd}
                        onAttackRemove={onAttackRemove}
                        onAttackChange={onAttackChange}
                        onAttackTestResult={onAttackTestResult}
                        onAttackDamageResult={onAttackDamageResult}
                        onAttackCritDamageResult={onAttackCritDamageResult}
                        onAbilityAdd={onAbilityAdd}
                        onAbilityRemove={onAbilityRemove}
                        onAbilityChange={onAbilityChange}
                        onResistanceAdd={onResistanceAdd}
                        onResistanceRemove={onResistanceRemove}
                        onResistanceChange={onResistanceChange}
                        onVulnerabilityAdd={onVulnerabilityAdd}
                        onVulnerabilityRemove={onVulnerabilityRemove}
                        onVulnerabilityChange={onVulnerabilityChange}
                        onImmunityAdd={onImmunityAdd}
                        onImmunityRemove={onImmunityRemove}
                        onImmunityChange={onImmunityChange}
                    />
                );

            case "skills":

                return (
                    <SkillsSection
                        monster={monster}
                        onSkillAdd={onSkillAdd}
                        onSkillRemove={onSkillRemove}
                        onSkillChange={onSkillChange}
                        onSkillResult={onSkillResult}
                    />
                );

            case "description":

                return (
                    <DescriptionSection
                        monster={monster}
                        onDescriptionChange={onDescriptionChange}
                        onFearEnigmaChange={onFearEnigmaChange}
                    />
                );

            default:

                return null;

        }

    }

    return (

        <section
            className="
                min-h-[350px]
                rounded-xl
                border
                border-zinc-800
                bg-zinc-900
                p-6
            "
        >

            {renderContent()}

        </section>

    );

}