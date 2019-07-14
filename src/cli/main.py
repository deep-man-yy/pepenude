import sys
import argparse
import cv2
import time
from run import process
from multiprocessing import freeze_support

parser = argparse.ArgumentParser()
parser.add_argument(
    "-i", "--input", default="input.png", help="path of the photo to transform"
)
parser.add_argument(
    "-o",
    "--output",
    default="output.png",
    help="path where the transformed photo will be saved. (default: output.png)",
)
parser.add_argument(
    "--cpu",
    default=False,
    action="store_true",
    help="force photo processing with CPU (slower)",
)
parser.add_argument(
    "--gpu",
    action="append",
    type=int,
    help="ID of the GPU to use for processing. It can be used multiple times to specify multiple GPUs (Example: --gpu 0 --gpu 1 --gpu 2) This argument will be ignored if --cpu is active. (default: 0)",
)
parser.add_argument(
    "--enablepubes",
    action="store_true",
    default=False,
    help="generates pubic hair on output image",
)
args = parser.parse_args()

"""
main.py

 How to run:
 python3 main.py

"""

# ------------------------------------------------- main()
def main():
    start = time.time()

    # Read input image
    image = cv2.imread(args.input)

    gpu_ids = args.gpu

    if args.cpu:
        gpu_ids = None
    elif gpu_ids is None:
        gpu_ids = [0]

    # Process
    result = process(image, gpu_ids, args.enablepubes)

    # Write output image
    cv2.imwrite(args.output, result)

    end = time.time()
    duration = end - start

    # Done
    print("Done! We have taken", round(duration, 2), "seconds")

    # Exit
    sys.exit()


if __name__ == "__main__":
    freeze_support()
    main()
