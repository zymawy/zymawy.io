import { Stack, Text, Link, BookCover, BookFeedback } from '.';

export function BookPostFooter() {
	return (
		<Stack direction="row" gap="m">
			<Stack gap="m">
				<BookFeedback>If you have any feedback,</BookFeedback>
				<Text>
					<Link href="/book/">Preorder the book now</Link> with 20% discount!
				</Text>
			</Stack>
			<Link href="/book/">
				<BookCover book="washing-your-code" />
			</Link>
		</Stack>
	);
}
