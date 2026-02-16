from bs4 import BeautifulSoup
import os
import sys
import re

class SiteChecker:
    def __init__(self):
        self.root_path = os.getcwd()

        to_skips = ['yandex', 'google', 'base']
        self.pages_to_check = []
        for file_name in os.listdir(self.root_path):
            if not file_name.endswith('html'): continue
            if any([to_skip in file_name for to_skip in to_skips]): continue
            self.pages_to_check.append(os.path.join(self.root_path, file_name))

        self.should_fix = False
        self.errors = []

    # Checks that all img tags reference locally stored images and that all
    # locally stored images are referenced.
    def check_images(self):
        image_dirs = ['img', 'download/fractalz-gallery']
        stored_images = set()
        for image_dir in image_dirs:
            for file_name in os.listdir(
                    os.path.join(self.root_path, image_dir)):
                stored_images.add(image_dir + '/' + file_name)

        used_images = {'img/0012.gif', 'img/0103.png', 'img/favicon.ico'}
        for page in self.pages_to_check:
            soup = BeautifulSoup(open(page, 'r').read(), 'html.parser')
            for img in soup.find_all('img'):
                src = img["src"]
                used_images.add(src)
                if not src in stored_images:
                    self.errors.append(
                        "Referencing non-existent image %s on page %s." % (
                        src, page))

        for unused_image in sorted(list(stored_images - used_images)):
            self.errors.append("Unused image: %s" % unused_image)

    # Checks that page conforms to template in base.html and fixes if necessary.
    def check_base(self):
        def replace_div( page_html, base_html, div_id):
            regex = re.compile('<div id="%s">.*?</div>' % div_id, re.DOTALL)
            base_div_html = re.search(regex, base_html)
            assert base_div_html is not None
            base_div_html = base_div_html.group(0)
            page_div_html = re.search(regex, page_html)
            assert page_div_html is not None
            page_div_html = page_div_html.group(0)
            return page_html.replace(page_div_html, base_div_html)

        base_html = open(os.path.join(self.root_path, 'base.html'), 'r').read()
        for page in self.pages_to_check:
            page_html = open(page, 'r').read()
            expected_html = replace_div(page_html, base_html, "header")
            expected_html = replace_div(expected_html, base_html, "footer")

            if page_html != expected_html:
                if self.should_fix:
                    print('Fixing %s' % page)
                    open(page, 'w').write(expected_html)
                else:
                    self.errors.append("Page %s does not conform to base template." % page)

    # Performs all checks, applies fixes if self.should_fix is True.
    def do_check(self):
        self.check_base()
        self.check_images()

        if len(self.errors) > 0:
            for error in self.errors: print(error)
            exit(1)
        else:
            print("All checks OK.")


if __name__ == "__main__":
    sc = SiteChecker()
    if '--fix' in sys.argv:
        sc.should_fix = True
    sc.do_check()
