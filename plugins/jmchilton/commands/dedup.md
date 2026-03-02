Analyze the provided code path(s) for duplication using semantic analysis. Generate a detailed deduplication report with:

1. **Executive Summary**
   - Total duplication statistics (lines, percentage)
   - Top 3-5 high-impact refactoring opportunities
   - Estimated maintainability improvement

2. **For each significant duplication group found:**
   - Type (I: exact, II: structural, III: near-miss, IV: functional)
   - Number of instances and file locations
   - Impact level (High/Medium/Low)
   - Representative code example showing the duplication
   - Recommended refactoring technique(s)
   - Before/after code examples
   - Any testing or risk considerations

3. **Consolidation Opportunities**
   - Extract Methods/Functions for reusable logic
   - Extract Constants for repeated values
   - Pull Up Methods to parent classes/modules
   - Design patterns (Factory, Strategy, Template Method, etc.)
   - Utility modules or shared helpers

4. **When NOT to refactor**
   - Note any coincidental similarity that shouldn't be consolidated
   - Identify performance-critical sections where duplication is acceptable
   - Flag areas with different change rates that will likely diverge

Focus on semantic duplication that impacts code maintainability. Ignore trivial or coincidental similarities. Prioritize refactorings by impact and feasibility.
