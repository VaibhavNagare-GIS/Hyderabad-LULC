# Hyderabad Land Change Atlas

A public, browser based record of how land cover in Hyderabad District changed between 2021 and 2025, built on Sentinel-2 satellite imagery and a Random Forest classifier in Google Earth Engine.

[![Live on GitHub Pages](https://img.shields.io/badge/Live%20site-GitHub%20Pages-2ea44f?style=for-the-badge&logo=github)](https://vaibhavnagare-gis.github.io/Hyderabad-LULC/)
[![License: MIT](https://img.shields.io/github/license/VaibhavNagare-GIS/Hyderabad-LULC?style=for-the-badge)](LICENSE)
[![Built with](https://img.shields.io/badge/Built%20with-HTML%20%7C%20CSS%20%7C%20JavaScript-orange?style=for-the-badge)](#tech-stack)

<br>

[![View the live map](https://img.shields.io/badge/%E2%86%97%20Open%20the%20live%20site-vaibhavnagare--gis.github.io%2FHyderabad--LULC-171717?style=for-the-badge)](https://vaibhavnagare-gis.github.io/Hyderabad-LULC/)

---

## About this project

This site presents a land use and land cover (LULC) classification of Hyderabad District for two years, 2021 and 2025, so the change between them can be seen and read in plain language rather than buried in a spreadsheet. It combines a live Earth Engine map, a year on year comparison chart, per class change cards, and a validated accuracy record, all built as a static site with no backend required.

The page is written for two kinds of readers at once: anyone who wants a quick, honest explanation of what changed in the city and why, and anyone with a GIS background who wants the actual classifier settings, predictor bands, and accuracy metrics behind the map.

## Features

- **Live Earth Engine map** embedded directly on the page, with a one click link to open it full screen
- **2021 vs 2025 comparison chart** for every mapped class, built with Chart.js and labelled with proper axis titles
- **Class by class change cards** showing the exact area, direction, and percent change for each land cover type
- **Accuracy and kappa coefficient** reported separately for both classification years, sourced from the validation error matrix
- **Plain language class guide** explaining what each mapped category actually looks like on the ground
- **Short, scannable interpretation cards** summarising what the numbers show and what is likely driving the change
- Fully static, works on GitHub Pages, no server side code

## How the classification was made

| Step | Detail |
|---|---|
| Study area | Hyderabad District, Telangana |
| Years mapped | 2021 and 2025 |
| Satellite source | Sentinel-2 Harmonized Surface Reflectance (`COPERNICUS/S2_SR_HARMONIZED`) |
| Cloud filter | Below 10 percent |
| Classifier | Random Forest, 100 trees |
| Predictor bands | B2, B3, B4, B8, B11, B12, NDVI, NDWI |
| Mapped classes | Built-up, Waterbody, Forest, Barren Land, Floating Vegetation |
| Platform | Google Earth Engine |

## Accuracy record

Each year's classification was checked against a separate set of validation points not used in training.

| Year | Overall accuracy | Kappa coefficient |
|---|---|---|
| 2021 | 96.01% | 0.943 |
| 2025 | 97.44% | 0.963 |

A full producer's and user's accuracy breakdown by class is available on the live site, inside the **Study details** tab.

## Tech stack

- **HTML5, CSS3, vanilla JavaScript** — no framework, no build step
- **[Chart.js](https://www.chartjs.org/)** — area comparison chart
- **[PapaParse](https://www.papaparse.com/)** — CSV parsing in the browser
- **[Google Earth Engine](https://earthengine.google.com/)** — satellite processing and classification
- **[IBM Plex Sans / Mono](https://fonts.google.com/specimen/IBM+Plex+Sans) and [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)** — typography, served via Google Fonts
- **GitHub Pages** — hosting

## Project structure

```
Hyderabad-LULC/
├── index.html                 # Page structure and content
├── styles.css                 # Base layout, typography, and colour system
├── enhancements.css           # Component styling: tabs, cards, chart layout, footer
├── script.js                  # CSV loading, chart rendering, tables, and interpretation
├── enhancements.js            # Tab switching and repository link setup
├── Data/
│   └── Hyderabad_LULC_Change_Statistics.csv   # 2021 to 2025 class area export
├── assets/
│   └── contour-bg.svg         # Background contour line pattern
├── LICENSE
└── README.md
```

## Running it locally

This is a static site, but the page loads the CSV data with `fetch`, which most browsers block when a file is opened directly from disk. Serve the folder with any local web server instead.

```bash
git clone https://github.com/VaibhavNagare-GIS/Hyderabad-LULC.git
cd Hyderabad-LULC
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Updating the data

To publish a new year or a corrected export:

1. Replace `Data/Hyderabad_LULC_Change_Statistics.csv`, keeping the column names `Class_ID`, `Class_Name`, `Area_2021_km2`, `Area_2025_km2`, and `Change_km2`.
2. If the accuracy or kappa values change, update the `ACCURACY` object at the top of `script.js`, since those figures come from Earth Engine's validation output and are not read from the CSV.
3. Commit and push to `main`; GitHub Pages redeploys automatically.

## Live Earth Engine App

The interactive classification map behind this page is hosted separately as a Google Earth Engine App:

**[vaibhav-gee.projects.earthengine.app/view/hyderabad-lulc](https://vaibhav-gee.projects.earthengine.app/view/hyderabad-lulc)**

## License

Released under the [MIT License](LICENSE).

## Author

**Vaibhav Shivaji Nagare**

[![GitHub](https://img.shields.io/badge/GitHub-VaibhavNagare--GIS-171515?style=for-the-badge&logo=github&logoColor=white)](https://github.com/VaibhavNagare-GIS)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-vaibhav--nagare--gis-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/vaibhav-nagare-gis)
