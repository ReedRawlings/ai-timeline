# AI Timeline

A comprehensive timeline of significant events in artificial intelligence, built with Hugo and featuring an interactive timeline interface.

## Features

### Interactive Timeline
- **Visual Timeline**: Events displayed in a horizontal scrolling timeline grouped by month
- **Event Details**: Click on any event to see detailed information including organizations, models, key figures, and impact areas
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Advanced Filtering System
- **Scaffolded Filters**: Filters dynamically update to show only relevant options based on your current selections
  - When you select a specific model (e.g., "GPT-4"), the Key Figures filter will only show figures associated with GPT-4 events
  - Organizations filter updates to show only organizations involved in currently visible events
  - All filters work together to provide a focused, relevant set of options
- **Multiple Filter Types**:
  - **Models**: Filter by specific AI models (GPT-4, Claude, DALL-E, etc.)
  - **Organizations**: Filter by companies and institutions (OpenAI, Google, Meta, etc.)
  - **Key Figures**: Filter by important people in AI (Sam Altman, Mark Zuckerberg, etc.)
  - **Impact Areas**: Filter by areas of impact (Healthcare, Ethics, Regulation, etc.)
  - **Tags**: Filter by event categories (Model, Product, Legal, Research, etc.)
- **Real-time Counter**: See how many events match your current filter criteria
- **Visual Indicators**: Scaffolded filters are highlighted with a special border and background
- **Clear All**: Reset all filters with one click


## Approved Tags:
- "Model" - New AI model releases or updates
- "Corporate" - Impacts on corporate structure, governance, hiring, or policies
- "Product" - Product launches or major updates
- "Research" - Academic papers, studies, or research findings
- "Policy" - Government regulations, policies, or legal developments
- "Economic" - Market movements, funding, acquisitions, IPOs
- "Social" - Public reactions, controversies, cultural impact
- "Technical" - Infrastructure, hardware, or platform developments
- "Partnership" - Collaborations or strategic partnerships
- "Safety" - AI safety, alignment, or risk-related developments

## APPROVED Common Impact Areas:
- "Multimodal AI"
- "Language Models"
- "Computer Vision"
- "Market Competition"
- "Robotics"
- "Healthcare"
- "Education"
- "Creator Economy"
- "Public Perception"
- "Ethics"
- "Regulation"
- "Enterprise AI"
- "Open Source"
- "Hardware"
- "Research"

### Data Management
- **YAML-based**: All event data stored in structured YAML format
- **Validation**: Built-in validation scripts ensure data integrity
- **Easy Updates**: Add new events by editing the YAML file

## Getting Started

1. **Install Hugo**: Make sure you have Hugo installed on your system
2. **Clone the repository**: `git clone [repository-url]`
3. **Run the development server**: `hugo server`
4. **Open your browser**: Navigate to `http://localhost:1313`

## Data Structure

Events are stored in `data/events.yaml` with the following structure:

```yaml
- title: "Event Title"
  date: "2023-01-01T10:00:00-07:00"
  tags: ["Model", "Product"]
  organizations: ["OpenAI"]
  models: ["GPT-4"]
  impact_areas: ["Multimodal AI"]
  key_figures: ["Sam Altman"]
  link: "https://example.com"
  description: "Event description..."
```

## Filtering Examples

### Scaffolded Filtering in Action

1. **Start with all events visible** - All filters show their complete set of options
2. **Select "OpenAI" in Organizations** - The Key Figures filter now only shows figures associated with OpenAI events
3. **Select "GPT-4" in Models** - The Impact Areas filter updates to show only areas impacted by GPT-4 events
4. **Select "Sam Altman" in Key Figures** - The Tags filter shows only tags for events involving Sam Altman at OpenAI with GPT-4

This creates a focused, relevant filtering experience where each selection narrows down the available options in other filters, making it easier to find specific events or explore relationships between different aspects of AI development.

## Contributing

1. Add new events to `data/events.yaml`
2. Run validation: `python scripts/validate-yaml.py`
3. Test your changes locally with `hugo server`
4. Submit a pull request

## License

[Add your license information here]


