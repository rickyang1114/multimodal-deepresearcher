# Multimodal DeepResearcher: Generating Text-Chart Interleaved Reports From Scratch with Agentic Framework

<p align="center">
  <a href="https://arxiv.org/abs/2506.02454/" target="_blank"><img src="https://img.shields.io/badge/arXiv-2506.02454-red"></a>
  <a href="https://rickyang1114.github.io/multimodal-deepresearcher/" target="_blank"><img src="https://img.shields.io/badge/Project-Page-brightgreen"></a>
  <a href="https://huggingface.co/papers/2506.02454" target="_blank"><img src="https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Daily Papers-red"></a>
  <a href="https://www.youtube.com/watch?v=zGYwByishW8" target="_blank"><img src="https://img.shields.io/badge/YouTube-red?logo=youtube&logoColor=white"></a> 
</p>

We introduce an **agentic framework** that automatically generates comprehensive multimodal reports **from scratch** with **interleaved texts and visualizations**, going beyond text-only content generation.

This repo hosts the source code of the demo website for the project. Code will be released upon paper acceptance.

## Overall Framework

![framework](./public/mdr/framework.png)

Multimodal DeepResearcher decomposes the task of multimodal report generation into four stages: (A) erative researching about given topic; (B) Exemplar textualization of multimodal reports from human experts using proposed **Formal Description of Visualization (FDV)**; (C) Planning; (D) Report Generation, which generates the final report with crafting, coding and iterative refinement.

## Formal Description of Visualization (FDV)

![Formal Description of Visualization](./public/mdr/fdv.png)

We propose FDV, a structured textual representation of charts that enables Large Language Models to learn from and generate diverse, high-quality visualizations.

## Experiments

Our task requires generating a multimodal report from scratch, which is infeasible with direct
prompting or existing deep research frameworks. We incorporate our researching module and adapt the framework of [DataNarrative](https://aclanthology.org/2024.emnlp-main.1073/) accordingly to establish our
baseline.

We develop both automatic evaluation (MLLM-as-a-judge) and human evaluation with five dedicated evaluation metrics. Here are the results:

Automatic evaluation results:

<p align="center">
  <img src="./public/mdr/exp-auto.png" alt="Automatic evaluation results" />
</p>

Human Evaluation results:

<p align="center">
  <img src="./public/mdr/exp-human.png" alt="Human evaluation results" />
</p>

## Acknowledgement

The demo website is built upon the template from [Tailwind Nextjs Starter Blog](https://github.com/timlrx/tailwind-nextjs-starter-blog). The original README for the template is [here](README-tailwind-started-blog.md).

We are inspired by many previous works. To name a few, [DataNarrative](https://github.com/saidul-islam98/DataNarrative), [PPT Agent](https://github.com/icip-cas/PPTAgent) and previous deep research frameworks, such as [deep-research](https://github.com/dzhng/deep-research), [node-DeepResearch](https://github.com/jina-ai/) and [manus](https://manus.im/).

## Citation

If you find our work interesting, consider citing us via:

```bibtex
@inproceedings{yang2025multimodal,
  title={Multimodal deepresearcher: Generating text-chart interleaved reports from scratch with agentic framework},
  author={Yang, Zhaorui and Pan, Bo and Wang, Han and Wang, Yiyao and Liu, Xingyu and Weng, Luoxuan and Feng, Yingchaojie and Feng, Haozhe and Zhu, Minfeng and Zhang, Bo and Chen, Wei},
  booktitle={Proceedings of the AAAI Conference on Artificial Intelligence},
  year={2026}
}
```
