# Multimodal DeepResearcher: Generating Text-Chart Interleaved Reports From Scratch with Agentic Framework

We introduce an **agentic framework** that automatically generates comprehensive multimodal reports **from scratch** with **interleaved texts and visualizations**, going beyond text-only content generation.

This repo hosts the source code of the demo website for the project. Code will be released upon paper acceptance.

## Overall Framework

![framework](public/mdr/framework.png)

Multimodal DeepResearcher decomposes the task of multimodal report generation into four stages: (A) erative researching about given topic; (B) Exemplar textualization of multimodal reports from human experts using proposed **Formal Description of Visualization (FDV)**; (C) Planning; (D) Report Generation, which generates the final report with crafting, coding and iterative refinement.

## Formal Description of Visualization (FDV)

![Formal Description of Visualization](public/mdr/fdv.png)

We propose FDV, a structured textual representation of charts that enables Large Language Models to learn from and generate diverse, high-quality visualizations.

## Acknowledgement
The demo website is built upon the template from [Tailwind Nextjs Starter Blog](https://github.com/timlrx/tailwind-nextjs-starter-blog). The original README for the template is [here](README-tailwind-started-blog.md).