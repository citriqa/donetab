{
	pkgs,
	lib,
	config,
	inputs,
	...
}: let
	formatters = with pkgs; [
		dprint
		# upcoming alejandra version supports tab indentation
		(alejandra.overrideAttrs (
				final: prev: rec {
					version = "3.1.unreleased";
					src =
						pkgs.fetchFromGitHub {
							owner = "kamadorueda";
							repo = "alejandra";
							rev = "6db88764334bd6a8b7a33cb312c318baad1d5e93";
							hash = "sha256-5xYai0KZirUX2EQpNMMCWoC27932n/i1E4KeVRIss7s=";
						};
					cargoDeps =
						prev.cargoDeps.overrideAttrs (final: prev: {
								inherit src;
								outputHash = "sha256-T3uaQvC+TKwSjdHl676wwQFpFL7uzNYb3NIaDmYGR9I=";
							});
				}
			))
	];
in {
	packages =
		[
			pkgs.treefmt
			pkgs.dprint
		]
		++ formatters;

	languages.javascript = {
		enable = true;
		pnpm.enable = true;
	};

	git-hooks.hooks = {
		treefmt = {
			enable = true;
			# no treefmt settings supported yet, update when https://github.com/cachix/devenv/pull/1679 lands
			settings.formatters = formatters;
		};
	};
}
