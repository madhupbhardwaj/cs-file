# Python Practical File Maker

Turn your Python programs into a ready-to-submit practical file. Add your code, run it in the browser, and download a Word or PDF document with one program per page.

**Live site:** [cs-file.vercel.app](https://cs-file.vercel.app)

![Python Practical File Maker](screenshot.png)

## Features

- **Add programs your way.** Upload `.py` files, drag and drop them, paste code, or type it in.
- **Questions filled in automatically.** The comment or docstring at the top of each program becomes its question.
- **Runs your code in the browser.** Sample output is produced by actually running the program with your sample input.
- **Python IDLE look, live.** While you edit, code appears in an IDLE editor window and output in an IDLE Shell window, using IDLE's own colours. What you see is what you download.
- **Word and PDF export.** Choose one program per page, or two per page to save paper. An optional cover page lists every program.
- **Program list.** The sidebar lists every program with its status, so you can jump to any one.
- **Saves as you go.** Your programs are kept in your browser between visits.
- **Private.** Nothing is uploaded; everything happens on your device.

## How to use

1. Add your programs by uploading `.py` files, pasting code, or clicking **Blank program**.
2. Check each program's **Question**.
3. In **Sample Input**, type what you would enter for each `input()`, one line per call.
4. Press **Run** to fill in the **Sample Output**.
5. Add your name and class, choose **1 per page** or **2 per page**, then click **Download .docx** or **Download PDF**.

### Writing questions in your code

Put the question at the top of the file as a comment or a docstring:

```python
# Q1. Write a program to find the sum of two numbers.
a = int(input("Enter a: "))
b = int(input("Enter b: "))
print("Sum =", a + b)
```

To paste several programs at once, separate them with a line containing only `#---`.

### Sample input

Each `input()` reads one line. For the program above:

```
12
30
```

If one `input()` reads several values with `.split()`, put them on the same line.

## Output format

Each program has four sections. With **1 per page**, every program starts on a new page. With **2 per page**, programs follow one another with at most two on a page; if the second one doesn't fit, it continues on the next page.

| Section | Appearance |
|---|---|
| Question | Plain text |
| Code | IDLE editor window with syntax colours |
| Sample Input | White box |
| Sample Output | IDLE Shell window: output in blue, typed input in black, errors in red |

## Limitations

The code runs on [Skulpt](https://skulpt.org), a Python 3 interpreter written in JavaScript. Most school-level programs work, but some features are not supported:

- File handling (`open()` for writing, `pickle`, `csv`), `mysql.connector`, `numpy`, `pandas`
- `match`/`case`, the walrus operator `:=`, and `nonlocal`
- Some unformatted decimal results print differently from standard Python

For these programs, run them on your computer and paste the output into **Sample Output**. Your text is kept as it is.

## Built with

- HTML, CSS and JavaScript in a single file, with no build step and no backend
- [Skulpt](https://github.com/skulpt/skulpt) to run Python in the browser
- [JSZip](https://github.com/Stuk/jszip) to build `.docx` files
- [jsPDF](https://github.com/parallax/jsPDF) to build PDF files
- [DejaVu Sans Mono](https://dejavu-fonts.github.io) as the code font in PDFs

## Repository contents

| File | Purpose |
|---|---|
| `index.html` | The whole app |
| `favicon.ico`, `favicon.svg`, `apple-touch-icon.png` | Site icons |
| `og-image.png` | Preview image shown when the link is shared |
| `screenshot.png` | Screenshot used in this README |

## Running locally

Open `index.html` in any modern browser. An internet connection is needed the first time so the libraries can load.

## Deploying

The site is static, with no build step. To host your own copy on Vercel, import this repository, set **Framework Preset** to **Other**, and deploy. Every push to the main branch updates the site.

Visitor counts use [Vercel Web Analytics](https://vercel.com/docs/analytics). To see them, open the project in Vercel, go to **Analytics**, and click **Enable**.

## Author

Built by **Madhup**.
