import { IConditionalRule } from '../models/Form';

interface EvaluationResult {
  visibleFields: string[];
  requiredFields: string[];
  hiddenFields: string[];
}

class ConditionalLogicEngine {
  /**
   * Evaluate all conditional rules against current form responses
   */
  evaluate(
    rules: IConditionalRule[],
    responses: Record<string, any>,
    allFieldIds: string[]
  ): EvaluationResult {
    const visibleFields = new Set<string>(allFieldIds);
    const requiredFields = new Set<string>();
    const hiddenFields = new Set<string>();

    // Apply each rule
    for (const rule of rules) {
      const triggerValue = responses[rule.fieldId];
      const conditionMet = this.checkCondition(rule.condition, triggerValue, rule.value);

      if (conditionMet) {
        this.applyAction(rule.action, rule.targetFieldIds, visibleFields, requiredFields, hiddenFields);
      }
    }

    return {
      visibleFields: Array.from(visibleFields),
      requiredFields: Array.from(requiredFields),
      hiddenFields: Array.from(hiddenFields),
    };
  }

  /**
   * Check if a condition is met
   */
  private checkCondition(
    condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan',
    actualValue: any,
    expectedValue: any
  ): boolean {
    // Handle null/undefined values
    if (actualValue === null || actualValue === undefined) {
      return condition === 'notEquals' ? expectedValue !== null && expectedValue !== undefined : false;
    }

    switch (condition) {
      case 'equals':
        return this.compareValues(actualValue, expectedValue) === 0;

      case 'notEquals':
        return this.compareValues(actualValue, expectedValue) !== 0;

      case 'contains':
        if (typeof actualValue === 'string') {
          return actualValue.toLowerCase().includes(String(expectedValue).toLowerCase());
        }
        if (Array.isArray(actualValue)) {
          return actualValue.includes(expectedValue);
        }
        return false;

      case 'greaterThan':
        return this.compareValues(actualValue, expectedValue) > 0;

      case 'lessThan':
        return this.compareValues(actualValue, expectedValue) < 0;

      default:
        return false;
    }
  }

  /**
   * Compare two values
   */
  private compareValues(a: any, b: any): number {
    // Try numeric comparison first
    const numA = Number(a);
    const numB = Number(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }

    // String comparison
    const strA = String(a).toLowerCase();
    const strB = String(b).toLowerCase();
    return strA === strB ? 0 : strA > strB ? 1 : -1;
  }

  /**
   * Apply an action to target fields
   */
  private applyAction(
    action: 'show' | 'hide' | 'require' | 'unrequire',
    targetFieldIds: string[],
    visibleFields: Set<string>,
    requiredFields: Set<string>,
    hiddenFields: Set<string>
  ): void {
    switch (action) {
      case 'show':
        targetFieldIds.forEach(id => {
          visibleFields.add(id);
          hiddenFields.delete(id);
        });
        break;

      case 'hide':
        targetFieldIds.forEach(id => {
          visibleFields.delete(id);
          hiddenFields.add(id);
          requiredFields.delete(id); // Hidden fields can't be required
        });
        break;

      case 'require':
        targetFieldIds.forEach(id => {
          if (visibleFields.has(id)) {
            requiredFields.add(id);
          }
        });
        break;

      case 'unrequire':
        targetFieldIds.forEach(id => {
          requiredFields.delete(id);
        });
        break;
    }
  }

  /**
   * Validate that rules don't create circular dependencies
   */
  validateRules(rules: IConditionalRule[]): { valid: boolean; error?: string } {
    // Build dependency graph
    const dependencies = new Map<string, Set<string>>();

    for (const rule of rules) {
      if (!dependencies.has(rule.fieldId)) {
        dependencies.set(rule.fieldId, new Set());
      }
      rule.targetFieldIds.forEach(targetId => {
        dependencies.get(rule.fieldId)!.add(targetId);
      });
    }

    // Check for cycles using DFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (node: string): boolean => {
      visited.add(node);
      recursionStack.add(node);

      const neighbors = dependencies.get(node) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(node);
      return false;
    };

    for (const fieldId of dependencies.keys()) {
      if (!visited.has(fieldId)) {
        if (hasCycle(fieldId)) {
          return {
            valid: false,
            error: 'Circular dependency detected in conditional rules',
          };
        }
      }
    }

    return { valid: true };
  }
}

export const conditionalLogicEngine = new ConditionalLogicEngine();
