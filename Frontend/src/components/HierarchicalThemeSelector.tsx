import { useState, useEffect } from "react"
import themesData from "@/data/themes-hierarchy.json"

interface Theme {
  id: string
  name: string
  code: string
}

interface Subcategory {
  id: string
  name: string
  themes: Theme[]
}

interface Category {
  id: string
  name: string
  subcategories: Subcategory[]
}

interface HierarchicalThemeSelectorProps {
  onSelectionChange: (selection: {
    category?: string
    subcategory?: string
    theme?: string
    themeCode?: string
    year?: string
    geographicLevel?: string
  }) => void
}

export function HierarchicalThemeSelector({ onSelectionChange }: HierarchicalThemeSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("")
  const [selectedTheme, setSelectedTheme] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedLevel, setSelectedLevel] = useState<string>("")

  const categories: Category[] = themesData.categories
  const years: string[] = themesData.years
  const geographicLevels = themesData.geographicLevels

  // Get subcategories for selected category
  const subcategories = categories.find(c => c.id === selectedCategory)?.subcategories || []

  // Get themes for selected subcategory
  const themes = subcategories.find(s => s.id === selectedSubcategory)?.themes || []

  // Get selected theme details
  const selectedThemeObj = themes.find(t => t.id === selectedTheme)

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange({
      category: selectedCategory,
      subcategory: selectedSubcategory,
      theme: selectedTheme,
      themeCode: selectedThemeObj?.code,
      year: selectedYear,
      geographicLevel: selectedLevel
    })
  }, [selectedCategory, selectedSubcategory, selectedTheme, selectedYear, selectedLevel, selectedThemeObj, onSelectionChange])

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setSelectedSubcategory("")
    setSelectedTheme("")
  }

  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId)
    setSelectedTheme("")
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Category */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          1. Catégorie principale
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="">Sélectionner une catégorie</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Step 2: Subcategory */}
      {selectedCategory && subcategories.length > 0 && (
        <div className="space-y-2 animate-in fade-in duration-300">
          <label className="block text-sm font-medium text-gray-700">
            2. Sous-catégorie
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedSubcategory}
            onChange={(e) => handleSubcategoryChange(e.target.value)}
          >
            <option value="">Sélectionner une sous-catégorie</option>
            {subcategories.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Step 3: Theme */}
      {selectedSubcategory && themes.length > 0 && (
        <div className="space-y-2 animate-in fade-in duration-300">
          <label className="block text-sm font-medium text-gray-700">
            3. Thème précis
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
          >
            <option value="">Sélectionner un thème</option>
            {themes.map(theme => (
              <option key={theme.id} value={theme.id}>{theme.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Step 4: Year */}
      {selectedTheme && (
        <div className="space-y-2 animate-in fade-in duration-300">
          <label className="block text-sm font-medium text-gray-700">
            4. Année
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Sélectionner une année</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      )}

      {/* Step 5: Geographic Level */}
      {selectedYear && (
        <div className="space-y-2 animate-in fade-in duration-300">
          <label className="block text-sm font-medium text-gray-700">
            5. Niveau géographique
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="">Sélectionner un niveau</option>
            {geographicLevels.map(level => (
              <option key={level.id} value={level.id}>{level.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Selection Summary */}
      {selectedCategory && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Sélection actuelle:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            {selectedCategory && <p>📁 {categories.find(c => c.id === selectedCategory)?.name}</p>}
            {selectedSubcategory && <p className="ml-4">📂 {subcategories.find(s => s.id === selectedSubcategory)?.name}</p>}
            {selectedTheme && <p className="ml-8">📄 {selectedThemeObj?.name}</p>}
            {selectedYear && <p className="ml-8">📅 {selectedYear}</p>}
            {selectedLevel && <p className="ml-8">🌍 {geographicLevels.find(l => l.id === selectedLevel)?.name}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
